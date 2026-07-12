import os
import time
import socket
from typing import Any, Dict, List, Optional
from fastapi import status
from pydantic import BaseModel, Field

# Import new Google GenAI SDK
try:
    from google import genai
    from google.genai import types
    from google.genai.errors import APIError
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

from app.ai.base import BaseLLMService
from app.config.config import settings
from app.utils.logging import logger
from app.ai.base import BaseLLMService
from fastapi import HTTPException

# =====================================================================
# Custom Exceptions for robust error handling
# =====================================================================

class AIException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)

class AIConfigError(AIException):
    def __init__(self, detail: str = "Gemini API key is not configured or is invalid"):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)

class AIRateLimitError(AIException):
    def __init__(self, detail: str = "AI Service rate limit exceeded. Please try again later"):
        super().__init__(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=detail)

class AITimeoutError(AIException):
    def __init__(self, detail: str = "AI Service request timed out. Please try again"):
        super().__init__(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail=detail)

class AIValidationError(AIException):
    def __init__(self, detail: str = "Empty or invalid input provided to AI Service"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

class AIAPIError(AIException):
    def __init__(self, detail: str = "AI Service returned an error"):
        super().__init__(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)


# =====================================================================
# Pydantic Schemas matching strict endpoint responses
# =====================================================================

class PolicySummaryOutputSchema(BaseModel):
    summary: List[str] = Field(description="Exactly 3 concise bullet points.")

class ESGInsightsOutputSchema(BaseModel):
    overall_health: str = Field(description="Overall ESG Health rating (e.g. Excellent, Good, Fair, Poor).")
    insight: str = Field(description="Structured natural language markdown insights.")

class AdvisorOutputSchema(BaseModel):
    answer: str = Field(description="ESG consultant response between 150 and 250 words, formatted in markdown.")


# =====================================================================
# Helper to load prompts
# =====================================================================

def load_prompt_template(filename: str) -> str:
    """Reads system prompt instructions from disk."""
    path = os.path.join(os.path.dirname(__file__), "prompts", filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Prompt template file '{filename}' not found at {path}")
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


# =====================================================================
# Retry decorator with exponential backoff
# =====================================================================

def retry_on_transient_failures(max_retries: int = 3, initial_delay: float = 1.0, backoff_factor: float = 2.0):
    def decorator(func):
        def wrapper(*args, **kwargs):
            delay = initial_delay
            last_ex = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_ex = e
                    # Check if error is retryable (Rate Limits 429, timeouts, or network glitches)
                    is_retryable = False
                    
                    if GENAI_AVAILABLE and isinstance(e, APIError):
                        status_code = getattr(e, "code", None)
                        if status_code in (429, 500, 503, 504) or "quota" in str(e).lower():
                            is_retryable = True
                    elif isinstance(e, (socket.timeout, TimeoutError)):
                        is_retryable = True
                        
                    if is_retryable and attempt < max_retries - 1:
                        logger.warning(
                            f"AI Service transient failure (attempt {attempt + 1}/{max_retries}): {e}. "
                            f"Retrying in {delay:.1f}s..."
                        )
                        time.sleep(delay)
                        delay *= backoff_factor
                    else:
                        # Non-retryable error or retries exhausted
                        raise e
            raise last_ex
        return wrapper
    return decorator


# =====================================================================
# Gemini Service Implementation
# =====================================================================

class GeminiService(BaseLLMService):
    """
    Production-ready Gemini implementation of the BaseLLMService contract.
    Uses structured output constraints and separate prompt files.
    """
    def __init__(self, api_key: Optional[str] = None) -> None:
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = "gemini-2.5-flash"  # Default recommended model
        
        if not GENAI_AVAILABLE:
            logger.error("google-genai SDK is not installed.")
            self.client = None
            return

        if not self.api_key:
            logger.warning("GEMINI_API_KEY is missing. GeminiService running in development MOCK mode.")
            self.client = None
        else:
            # Initialize the official SDK GenAI client
            self.client = genai.Client(api_key=self.api_key)

    @retry_on_transient_failures(max_retries=3)
    def summarize_policy(self, policy_text: str) -> List[str]:
        """Summarizes policy text into exactly 3 bullet points."""
        if not policy_text or len(policy_text.strip()) < 10:
            raise AIValidationError("Policy text is empty or too short (minimum 10 characters).")

        # If running in mock mode
        if not self.client:
            logger.info("MOCK AI Call: Summarizing policy...")
            return [
                "Understand compliance policies to reduce office emissions.",
                "Mandatory recycling practices apply to all office desks.",
                "Contact sustainability manager for green transport reimbursements."
            ]

        try:
            logger.info(f"AI Request: Summarizing policy (length: {len(policy_text)} chars)")
            system_prompt = load_prompt_template("policy_summary.txt")

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=policy_text,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                    response_schema=PolicySummaryOutputSchema,
                    temperature=0.1,  # Low temperature for highly deterministic answers
                )
            )

            # Log tokens usage if present
            if response.usage_metadata:
                logger.info(
                    f"AI Tokens: Prompt={response.usage_metadata.prompt_token_count}, "
                    f"Candidates={response.usage_metadata.candidates_token_count}"
                )

            # Parse JSON schema response
            import json
            data = json.loads(response.text)
            summary_list = data.get("summary", [])
            
            logger.info(f"AI Response: Policy summary successfully generated with {len(summary_list)} bullet points.")
            return summary_list

        except APIError as e:
            self._handle_api_error(e)
        except Exception as e:
            self._handle_general_error(e)

    @retry_on_transient_failures(max_retries=3)
    def generate_esg_insights(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Generates overall health and insights from department metrics."""
        if not metrics or "department" not in metrics:
            raise AIValidationError("Invalid department metrics supplied.")

        # Check mock mode
        if not self.client:
            logger.info(f"MOCK AI Call: Generating ESG insights for department '{metrics.get('department')}'...")
            return {
                "overall_health": "Good",
                "insight": "### Overall ESG Health\nDepartment operations are running green.\n\n### Positive Observations\nHigh employee CSR rate.\n\n### Risks\nRising carbon emissions."
            }

        try:
            logger.info(f"AI Request: Generating ESG insights for '{metrics.get('department')}'")
            raw_prompt_template = load_prompt_template("esg_insights.txt")
            
            # Format prompt text with metrics
            formatted_prompt = raw_prompt_template.format(
                department=metrics.get("department", "Unknown"),
                environment_score=metrics.get("environment_score", 0),
                social_score=metrics.get("social_score", 0),
                governance_score=metrics.get("governance_score", 0),
                carbon_emission=metrics.get("carbon_emission", 0),
                previous_carbon_emission=metrics.get("previous_carbon_emission", 0),
                csr_participation=metrics.get("csr_participation", 0),
                pending_compliance=metrics.get("pending_compliance", 0)
            )

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=formatted_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ESGInsightsOutputSchema,
                    temperature=0.2,
                )
            )

            if response.usage_metadata:
                logger.info(
                    f"AI Tokens: Prompt={response.usage_metadata.prompt_token_count}, "
                    f"Candidates={response.usage_metadata.candidates_token_count}"
                )

            import json
            data = json.loads(response.text)
            
            logger.info("AI Response: ESG Insights successfully generated.")
            return {
                "overall_health": data.get("overall_health", "Unknown"),
                "insight": data.get("insight", "")
            }

        except APIError as e:
            self._handle_api_error(e)
        except Exception as e:
            self._handle_general_error(e)

    @retry_on_transient_failures(max_retries=3)
    def generate_sustainability_advice(self, question: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Generates conversational ESG advisor responses."""
        if not question or not question.strip():
            raise AIValidationError("Advisor question is empty or invalid.")
        if not metrics or "department" not in metrics:
            raise AIValidationError("Invalid department metrics supplied.")

        # Check mock mode
        if not self.client:
            logger.info(f"MOCK AI Call: Answering advisor question '{question[:40]}...'")
            return {
                "answer": f"### ESG Consultant Feedback\nThank you for asking how to improve the sustainability profile of the **{metrics.get('department')}** department. With an environment score of **{metrics.get('environment_score')}/100** and carbon emissions at **{metrics.get('carbon_emission')} tons**, my recommendations are:\n\n1. **Reduce Carbon Impact**: Set up eco-restrictions on high-power machinery.\n2. **Compliance First**: Clean up the **{metrics.get('pending_compliance')} pending compliance issues** to secure governance standards.\n3. **Increase Engagement**: Raise your CSR participation of **{metrics.get('csr_participation')}%** by initiating carbon offset challenges."
            }

        try:
            logger.info(f"AI Request: Sustainability Advisor question: '{question[:40]}...'")
            raw_prompt_template = load_prompt_template("sustainability_advisor.txt")
            
            # Format prompt text with metrics and question
            formatted_prompt = raw_prompt_template.format(
                question=question,
                department=metrics.get("department", "Unknown"),
                environment_score=metrics.get("environment_score", 0),
                social_score=metrics.get("social_score", 0),
                governance_score=metrics.get("governance_score", 0),
                carbon_emission=metrics.get("carbon_emission", 0),
                csr_participation=metrics.get("csr_participation", 0),
                pending_compliance=metrics.get("pending_compliance", 0)
            )

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=formatted_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=AdvisorOutputSchema,
                    temperature=0.2,
                )
            )

            if response.usage_metadata:
                logger.info(
                    f"AI Tokens: Prompt={response.usage_metadata.prompt_token_count}, "
                    f"Candidates={response.usage_metadata.candidates_token_count}"
                )

            import json
            data = json.loads(response.text)
            
            logger.info("AI Response: Sustainability Advice successfully generated.")
            return {
                "answer": data.get("answer", "")
            }

        except APIError as e:
            self._handle_api_error(e)
        except Exception as e:
            self._handle_general_error(e)

    def _handle_api_error(self, e: Any) -> None:
        """Translates raw Google GenAI APIError exceptions into domain custom exceptions."""
        status_code = getattr(e, "code", None)
        message = str(e)
        
        logger.error(f"Gemini API Error occurred: {message} (code: {status_code})")
        
        if status_code == 429 or "quota" in message.lower():
            raise AIRateLimitError()
        elif status_code in (401, 403) or "api key" in message.lower():
            raise AIConfigError("Invalid Gemini API Key provided.")
        elif status_code == 408 or "timeout" in message.lower():
            raise AITimeoutError()
        else:
            raise AIAPIError(f"Gemini API error ({status_code}): {message}")

    def _handle_general_error(self, e: Exception) -> None:
        """Handles any unhandled connection/network errors."""
        message = str(e)
        logger.error(f"General error in GeminiService: {message}")
        if isinstance(e, (socket.timeout, TimeoutError)):
            raise AITimeoutError()
        raise AIAPIError(f"AI Service processing error: {message}")

# Singleton instance
gemini_service = GeminiService()
