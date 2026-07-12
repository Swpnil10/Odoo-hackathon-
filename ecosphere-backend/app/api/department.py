from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.utils.deps import get_db, RoleChecker
from app.models.user import UserRole
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from app.services.department import DepartmentService

router = APIRouter()

# RBAC Dependencies
allow_all = Depends(RoleChecker([UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE]))
allow_write = Depends(RoleChecker([UserRole.ADMIN, UserRole.MANAGER]))
allow_admin = Depends(RoleChecker([UserRole.ADMIN]))

@router.get("/", response_model=List[DepartmentResponse], dependencies=[allow_all])
def list_departments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)) -> List[DepartmentResponse]:
    """List all departments with pagination (accessible to all authenticated roles)."""
    return DepartmentService.get_all(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=DepartmentResponse, dependencies=[allow_all])
def get_department(id: int, db: Session = Depends(get_db)) -> DepartmentResponse:
    """Retrieve details of a single department (accessible to all authenticated roles)."""
    return DepartmentService.get_by_id(db, department_id=id)

@router.post("/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED, dependencies=[allow_write])
def create_department(department_in: DepartmentCreate, db: Session = Depends(get_db)) -> DepartmentResponse:
    """Create a new department (accessible to Admin and Manager)."""
    return DepartmentService.create(db, department_in=department_in)

@router.put("/{id}", response_model=DepartmentResponse, dependencies=[allow_write])
def update_department(
    id: int,
    department_in: DepartmentUpdate,
    db: Session = Depends(get_db)
) -> DepartmentResponse:
    """Update a department's details (accessible to Admin and Manager)."""
    return DepartmentService.update(db, department_id=id, department_in=department_in)

@router.delete("/{id}", response_model=DepartmentResponse, dependencies=[allow_admin])
def delete_department(id: int, db: Session = Depends(get_db)) -> DepartmentResponse:
    """Hard-delete a department by ID (restricted to Admin)."""
    return DepartmentService.delete(db, department_id=id)
