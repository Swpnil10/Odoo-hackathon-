import os
import json
from typing import List
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
import openai
from openai import OpenAI

router = APIRouter()

class PolicySummarizeRequest(BaseModel):
    policy_text: str = Field(
        ..., 
        description="The full corporate ESG policy text to be summarized."
    )

class PolicySummarizeResponse(BaseModel):
    summary_bullets: List[str] = Field(
        ..., 
        min_items=3, 
        max_items=3, 
        description="Exactly three concise, actionable bullet points summarizing the policy."
    )

@router.post("/summarize", response_model=PolicySummarizeResponse, status_code=status.HTTP_200_OK)
def summarize_policy(request: PolicySummarizeRequest) -> PolicySummarizeResponse:
    """
    Summarize a dense corporate ESG policy document down to exactly three actionable bullet points.
    Uses OpenAI GPT-4o-mini or GPT-3.5-turbo in JSON Mode.
    """
    # 1. Check if policy text is empty or too short
    if not request.policy_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Policy text cannot be empty."
        )

    # 2. Retrieve OpenAI configurations
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OPENAI_API_KEY environment variable is not configured."
        )
        
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    # 3. Restrictive compliance system prompt
    system_prompt = (
        "You are an expert ESG Compliance Officer. "
        "Your task is to analyze dense corporate ESG policies and distill them down to exactly three concise, actionable bullet points for employees. "
        "Each bullet point must start with a direct action verb (e.g., 'Turn off', 'Recycle', 'Report'). "
        "You must return a raw JSON object with a single key 'summary_bullets', which is a list of exactly three strings. "
        "Do not include any conversational filler, markdown formatting (like ```json), or explanatory text outside the JSON. "
        "JSON format must strictly be:\n"
        "{\n"
        '  "summary_bullets": [\n'
        '    "First actionable bullet point.",\n'
        '    "Second actionable bullet point.",\n'
        '    "Third actionable bullet point."\n'
        "  ]\n"
        "}"
    )

    # 4. Initiate OpenAI client and complete request
    client = OpenAI(api_key=api_key)
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Please summarize the following ESG policy text:\n\n{request.policy_text}"}
            ],
            response_format={"type": "json_object"},
            timeout=15.0
        )
    except openai.APITimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The AI Policy Summarizer service timed out waiting for OpenAI API."
        )
    except openai.OpenAIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"OpenAI API error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during API communication: {str(e)}"
        )

    # 5. Extract, parse, and validate JSON output
    content = response.choices[0].message.content
    if not content:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="OpenAI model returned an empty response."
        )

    try:
        data = json.loads(content)
        bullets = data.get("summary_bullets")
        
        if not isinstance(bullets, list):
            raise ValueError("The 'summary_bullets' field must be a list.")

        # Self-heal output to guarantee exactly 3 elements
        if len(bullets) < 3:
            # Pad with a generic actionable instruction
            bullets += ["Read the full policy document to ensure general compliance."] * (3 - len(bullets))
        elif len(bullets) > 3:
            # Truncate to the top 3
            bullets = bullets[:3]

        return PolicySummarizeResponse(summary_bullets=bullets)

    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to parse or validate LLM JSON response: {str(e)}"
        )
