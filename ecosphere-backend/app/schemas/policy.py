import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field, HttpUrl

class PolicyBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=150, description="Title of the policy")
    description: str = Field(..., min_length=10, description="Detailed description of the ESG policy")
    document_url: Optional[str] = Field(None, description="URL path to the full policy document")
    version: str = Field("1.0", max_length=20, description="Version of the policy (e.g. 1.0, 1.1)")
    status: Literal["draft", "active", "archived"] = "draft"

class PolicyCreate(PolicyBase):
    pass

class PolicyUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=150)
    description: Optional[str] = Field(None, min_length=10)
    document_url: Optional[str] = None
    version: Optional[str] = Field(None, max_length=20)
    status: Optional[Literal["draft", "active", "archived"]] = None

class PolicyResponse(PolicyBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime.datetime: lambda v: v.isoformat()
        }
