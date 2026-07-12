from fastapi import APIRouter, Depends, status
from app.utils.deps import get_current_user
from app.schemas.ai import (
    PolicySummaryRequest,
    PolicySummaryResponse,
    ESGInsightsRequest,
    ESGInsightsResponse,
    AdvisorRequest,
    AdvisorResponse
)
from app.ai.gemini import gemini_service
from app.models.user import User

router = APIRouter()

@router.post(
    "/policy-summary",
    response_model=PolicySummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Summarize ESG Policy text"
)
def summarize_policy(
    payload: PolicySummaryRequest,
    current_user: User = Depends(get_current_user)
) -> PolicySummaryResponse:
    """
    Summarizes ESG policies into exactly 3 bullet points.
    Protected by JWT Authentication (any role can access).
    """
    summary_bullets = gemini_service.summarize_policy(payload.policy_text)
    
    # Safe validation handling: ensure exactly 3 bullet points are returned
    if len(summary_bullets) < 3:
        summary_bullets += ["No additional policy requirements documented."] * (3 - len(summary_bullets))
    elif len(summary_bullets) > 3:
        summary_bullets = summary_bullets[:3]
        
    return PolicySummaryResponse(summary=summary_bullets)

@router.post(
    "/esg-insights",
    response_model=ESGInsightsResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Department ESG insights"
)
def generate_esg_insights(
    payload: ESGInsightsRequest,
    current_user: User = Depends(get_current_user)
) -> ESGInsightsResponse:
    """
    Analyzes department raw ESG performance numbers and generates natural language executive insights.
    Protected by JWT Authentication.
    """
    metrics_dict = payload.model_dump()
    insights = gemini_service.generate_esg_insights(metrics_dict)
    return ESGInsightsResponse(
        overall_health=insights.get("overall_health", "Unknown"),
        insight=insights.get("insight", "")
    )

@router.post(
    "/advisor",
    response_model=AdvisorResponse,
    status_code=status.HTTP_200_OK,
    summary="AI Sustainability Advisor Chat"
)
def sustainability_advisor(
    payload: AdvisorRequest,
    current_user: User = Depends(get_current_user)
) -> AdvisorResponse:
    """
    Conversational ESG Sustainability Advisor that answers user questions
    specifically in context of the provided department metrics.
    Protected by JWT Authentication.
    """
    metrics_dict = payload.model_dump(exclude={"question"})
    advice = gemini_service.generate_sustainability_advice(payload.question, metrics_dict)
    return AdvisorResponse(answer=advice.get("answer", ""))
