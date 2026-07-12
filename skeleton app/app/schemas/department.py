from pydantic import BaseModel, ConfigDict
from typing import Optional

class DepartmentBase(BaseModel):
    name: str
    code: str
    environmental_score: float = 100.0
    social_score: float = 100.0
    governance_score: float = 100.0
    employee_count: int = 0

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    environmental_score: Optional[float] = None
    social_score: Optional[float] = None
    governance_score: Optional[float] = None
    employee_count: Optional[int] = None
    total_esg_score: Optional[float] = None

class DepartmentResponse(DepartmentBase):
    id: int
    total_esg_score: float

    model_config = ConfigDict(from_attributes=True)
