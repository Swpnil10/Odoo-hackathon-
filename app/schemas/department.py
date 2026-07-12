from typing import Literal, Optional
from pydantic import BaseModel, Field

class DepartmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Name of the department")
    code: str = Field(..., min_length=2, max_length=50, description="Unique department code")
    head: Optional[str] = Field(None, max_length=100, description="Name or email of the department head")
    parent_department: Optional[str] = Field(None, max_length=100, description="Name of the parent department")
    employee_count: int = Field(0, ge=0, description="Number of employees in the department")
    status: Literal["active", "inactive"] = "active"

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    code: Optional[str] = Field(None, min_length=2, max_length=50)
    head: Optional[str] = Field(None, max_length=100)
    parent_department: Optional[str] = Field(None, max_length=100)
    employee_count: Optional[int] = Field(None, ge=0)
    status: Optional[Literal["active", "inactive"]] = None

class DepartmentResponse(DepartmentBase):
    id: int

    class Config:
        from_attributes = True
