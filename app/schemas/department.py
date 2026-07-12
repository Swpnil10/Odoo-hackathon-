from pydantic import BaseModel, ConfigDict
from typing import Optional

class DepartmentBase(BaseModel):
    name: str
    code: str

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    total_esg_score: Optional[float] = None

class DepartmentResponse(DepartmentBase):
    id: int
    total_esg_score: float

    model_config = ConfigDict(from_attributes=True)
