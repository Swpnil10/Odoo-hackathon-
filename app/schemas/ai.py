from typing import List
from pydantic import BaseModel, Field, field_validator

class PolicySummaryRequest(BaseModel):
    policy_text: str = Field(
        ...,
        min_length=10,
        description="The ESG policy text to summarize. Minimum 10 characters."
    )

class PolicySummaryResponse(BaseModel):
    summary: List[str] = Field(
        ...,
        description="Exactly 3 concise bullet points summarizing the ESG policy."
    )

    @field_validator("summary")
    @classmethod
    def validate_exactly_three_bullets(cls, v: List[str]) -> List[str]:
        if len(v) != 3:
            # We can log a warning or enforce it, but let's make sure it defaults or pads
            # In production, we enforce it to fit the spec
            raise ValueError("AI Summary must contain exactly 3 bullet points.")
        return v

class ESGInsightsRequest(BaseModel):
    department: str = Field(..., min_length=2, max_length=50, description="Department name.")
    environment_score: int = Field(..., ge=0, le=100, description="Environment score (0-100).")
    social_score: int = Field(..., ge=0, le=100, description="Social score (0-100).")
    governance_score: int = Field(..., ge=0, le=100, description="Governance score (0-100).")
    carbon_emission: int = Field(..., ge=0, description="Carbon emissions in tons.")
    previous_carbon_emission: int = Field(..., ge=0, description="Previous carbon emissions in tons.")
    csr_participation: int = Field(..., ge=0, le=100, description="CSR Activity participation rate (0-100%).")
    pending_compliance: int = Field(..., ge=0, description="Number of pending compliance tasks.")

class ESGInsightsResponse(BaseModel):
    overall_health: str = Field(
        ...,
        description="Rating of the department's overall ESG health (e.g. Excellent, Good, Fair, Poor)."
    )
    insight: str = Field(
        ...,
        description="Executive summary in natural language (formatted in Markdown)."
    )

class AdvisorRequest(BaseModel):
    question: str = Field(..., min_length=5, max_length=500, description="ESG-related query.")
    department: str = Field(..., min_length=2, max_length=50, description="Department name.")
    environment_score: int = Field(..., ge=0, le=100, description="Environment score (0-100).")
    social_score: int = Field(..., ge=0, le=100, description="Social score (0-100).")
    governance_score: int = Field(..., ge=0, le=100, description="Governance score (0-100).")
    carbon_emission: int = Field(..., ge=0, description="Carbon emissions in tons.")
    csr_participation: int = Field(..., ge=0, le=100, description="CSR Activity participation rate (0-100%).")
    pending_compliance: int = Field(..., ge=0, description="Number of pending compliance tasks.")

class AdvisorResponse(BaseModel):
    answer: str = Field(..., description="Conversational ESG consultant advice response (formatted in Markdown).")
