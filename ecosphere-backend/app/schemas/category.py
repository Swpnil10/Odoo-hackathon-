from typing import Literal, Optional
from pydantic import BaseModel, Field

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Name of the category")
    type: Literal["CSR Activity", "Challenge"] = Field(
        ...,
        description="Type of the category: CSR Activity or Challenge"
    )
    status: Literal["active", "inactive"] = "active"

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[Literal["CSR Activity", "Challenge"]] = None
    status: Optional[Literal["active", "inactive"]] = None

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True
