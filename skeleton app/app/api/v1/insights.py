import os
import json
from typing import List
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
import openai
from openai import OpenAI

router = APIRouter()

class InsightGenerationRequest(BaseModel):
    department_name: str = Field(
        ..., 
        description="The name of the department being evaluated."
    )
    env_score: float = Field(
        ..., 
        ge=0.0, 
        le=100.0, 
        description="Environmental score from 0 to 100."
    )
    social_score: float = Field(
        ..., 
        ge=0.0, 
        le=100.0, 
        description="Social score from 0 to 100."
    )
    gov_score: float = Field(
        ..., 
        ge=0.0, 
        le=100.0, 
        description="Governance score from 0 to 100."
    )
    forecasted_carbon: float = Field(
        ..., 
        ge=0.0, 
        description="Predicted total carbon emissions (kg) for the next 30 days."
    )
    open_compliance_issues: List[str] = Field(
        ..., 
        description="List of open compliance issues or anomalies reported."
    )

class ESGInsightsResponse(BaseModel):
    status_summary: str = Field(
        ..., 
        description="A short, professional status summary of the department's ESG performance."
    )
    actionable_recommendations: List[str] = Field(
        ..., 
        min_items=3, 
        max_items=3, 
        description="Exactly three actionable, clear sustainability recommendations."
    )

def parse_insight_context(req: InsightGenerationRequest) -> str:
    """
    Formats the request metrics into a clean, human-readable text report.
    This avoids passing raw JSON syntax directly to the LLM.
    """
    issues_text = "\n".join([f"- {issue}" for issue in req.open_compliance_issues]) if req.open_compliance_issues else "None"
    return (
        f"EcoSphere Sustainability Report\n"
        f"================================\n"
        f"Department: {req.department_name}\n"
        f"Environmental Score: {req.env_score}/100\n"
        f"Social Score: {req.social_score}/100\n"
        f"Governance Score: {req.gov_score}/100\n"
        f"Forecasted Carbon Footprint (Upcoming 30 Days): {req.forecasted_carbon} kg CO2\n"
        f"Open Compliance / Anomaly Issues:\n"
        f"{issues_text}"
    )

@router.post("/generate", response_model=ESGInsightsResponse, status_code=status.HTTP_200_OK)
def generate_insights(request: InsightGenerationRequest) -> ESGInsightsResponse:
    """
    Generate an executive ESG status summary and exactly three actionable recommendations for a department.
    Uses OpenAI GPT-4o-mini or GPT-3.5-turbo in JSON Mode.
    """
    # 1. Retrieve OpenAI configurations
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OPENAI_API_KEY environment variable is not configured."
        )
        
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # 2. Restrictive sustainability officer system prompt
    system_prompt = (
        "You are a Chief Sustainability Officer (CSO) analyzing a department's ESG metrics. "
        "Your task is to write:\n"
        "1. A status summary (exactly one short, professional paragraph) explaining their ESG performance and highlighting any concerns.\n"
        "2. Actionable recommendations (a list of exactly three actionable steps they can take to improve their ESG scores or reduce carbon footprint).\n"
        "Each recommendation must be brief and start with a direct action verb.\n\n"
        "You must strictly return a raw JSON object with two keys: 'status_summary' (a string) and 'actionable_recommendations' (a list of exactly three strings).\n"
        "Do not include any conversational filler, markdown formatting (like ```json), or explanatory text outside the JSON.\n"
        "JSON format must strictly be:\n"
        "{\n"
        '  "status_summary": "Summary paragraph goes here.",\n'
        '  "actionable_recommendations": [\n'
        '    "First recommendation.",\n'
        '    "Second recommendation.",\n'
        '    "Third recommendation."\n'
        '  ]\n'
        "}"
    )

    # 3. Format context using helper
    user_content = parse_insight_context(request)

    # 4. Initiate OpenAI client and complete request
    client = OpenAI(api_key=api_key)
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Here is the department sustainability report:\n\n{user_content}"}
            ],
            response_format={"type": "json_object"},
            timeout=15.0
        )
    except openai.APITimeoutError:
        raise HTTPException(
            status_code=status.HTTP_544_GATEWAY_TIMEOUT if hasattr(status, "HTTP_544_GATEWAY_TIMEOUT") else status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The AI ESG Insights Engine service timed out waiting for OpenAI API."
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
        status_summary = data.get("status_summary")
        recommendations = data.get("actionable_recommendations")
        
        if not status_summary or not isinstance(status_summary, str):
            status_summary = "Evaluated department metrics show baseline compliance with standard parameters."

        if not isinstance(recommendations, list):
            raise ValueError("The 'actionable_recommendations' field must be a list.")

        # Self-heal output to guarantee exactly 3 recommendations
        if len(recommendations) < 3:
            default_recommendations = [
                "Optimize energy usage by conducting regular audits.",
                "Review supply chain vendors for environmental compliance.",
                "Engage employees in corporate sustainability workshops."
            ]
            recommendations += default_recommendations[:(3 - len(recommendations))]
        elif len(recommendations) > 3:
            recommendations = recommendations[:3]

        return ESGInsightsResponse(
            status_summary=status_summary,
            actionable_recommendations=recommendations
        )

    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to parse or validate LLM JSON response: {str(e)}"
        )
