from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.utils.deps import get_db, RoleChecker
from app.models.user import UserRole
from app.schemas.policy import PolicyCreate, PolicyUpdate, PolicyResponse
from app.services.policy import PolicyService

router = APIRouter()

# RBAC Dependencies
allow_all = Depends(RoleChecker([UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE]))
allow_write = Depends(RoleChecker([UserRole.ADMIN, UserRole.MANAGER]))
allow_admin = Depends(RoleChecker([UserRole.ADMIN]))

@router.get("/", response_model=List[PolicyResponse], dependencies=[allow_all])
def list_policies(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> List[PolicyResponse]:
    """
    List policies (accessible to all authenticated roles).
    Allows optional filtering by status (e.g., draft, active, archived).
    """
    if status:
        return PolicyService.get_by_status(db, status_str=status, skip=skip, limit=limit)
    return PolicyService.get_all(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=PolicyResponse, dependencies=[allow_all])
def get_policy(id: int, db: Session = Depends(get_db)) -> PolicyResponse:
    """Retrieve details of a single ESG policy (accessible to all authenticated roles)."""
    return PolicyService.get_by_id(db, policy_id=id)

@router.post("/", response_model=PolicyResponse, status_code=status.HTTP_201_CREATED, dependencies=[allow_write])
def create_policy(policy_in: PolicyCreate, db: Session = Depends(get_db)) -> PolicyResponse:
    """Create a new ESG policy (accessible to Admin and Manager)."""
    return PolicyService.create(db, policy_in=policy_in)

@router.put("/{id}", response_model=PolicyResponse, dependencies=[allow_write])
def update_policy(
    id: int,
    policy_in: PolicyUpdate,
    db: Session = Depends(get_db)
) -> PolicyResponse:
    """Update an existing policy (accessible to Admin and Manager)."""
    return PolicyService.update(db, policy_id=id, policy_in=policy_in)

@router.delete("/{id}", response_model=PolicyResponse, dependencies=[allow_admin])
def delete_policy(id: int, db: Session = Depends(get_db)) -> PolicyResponse:
    """Delete a policy (restricted to Admin)."""
    return PolicyService.delete(db, policy_id=id)
