from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.utils.deps import get_db, RoleChecker
from app.models.user import UserRole
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services.category import CategoryService

router = APIRouter()

# RBAC Dependencies
allow_all = Depends(RoleChecker([UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE]))
allow_write = Depends(RoleChecker([UserRole.ADMIN, UserRole.MANAGER]))
allow_admin = Depends(RoleChecker([UserRole.ADMIN]))

@router.get("/", response_model=List[CategoryResponse], dependencies=[allow_all])
def list_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)) -> List[CategoryResponse]:
    """List categories with pagination (accessible to all authenticated roles)."""
    return CategoryService.get_all(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=CategoryResponse, dependencies=[allow_all])
def get_category(id: int, db: Session = Depends(get_db)) -> CategoryResponse:
    """Retrieve details of a single category (accessible to all authenticated roles)."""
    return CategoryService.get_by_id(db, category_id=id)

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED, dependencies=[allow_write])
def create_category(category_in: CategoryCreate, db: Session = Depends(get_db)) -> CategoryResponse:
    """Create a new category (accessible to Admin and Manager)."""
    return CategoryService.create(db, category_in=category_in)

@router.put("/{id}", response_model=CategoryResponse, dependencies=[allow_write])
def update_category(
    id: int,
    category_in: CategoryUpdate,
    db: Session = Depends(get_db)
) -> CategoryResponse:
    """Update an existing category (accessible to Admin and Manager)."""
    return CategoryService.update(db, category_id=id, category_in=category_in)

@router.delete("/{id}", response_model=CategoryResponse, dependencies=[allow_admin])
def delete_category(id: int, db: Session = Depends(get_db)) -> CategoryResponse:
    """Delete a category (restricted to Admin)."""
    return CategoryService.delete(db, category_id=id)
