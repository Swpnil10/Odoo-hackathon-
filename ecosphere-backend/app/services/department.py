from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.department import Department
from app.repositories.department import department_repository
from app.schemas.department import DepartmentCreate, DepartmentUpdate

class DepartmentService:
    """Service class for Department operations containing business logic validation."""
    
    @staticmethod
    def get_by_id(db: Session, department_id: int) -> Department:
        """Fetch department or raise HTTP 404."""
        db_dept = department_repository.get(db, department_id)
        if not db_dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Department with ID {department_id} not found"
            )
        return db_dept

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Department]:
        """Fetch multiple departments."""
        return department_repository.get_multi(db, skip=skip, limit=limit)

    @staticmethod
    def create(db: Session, department_in: DepartmentCreate) -> Department:
        """Create department, validating code uniqueness."""
        existing = department_repository.get_by_code(db, department_in.code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Department with code '{department_in.code}' already exists"
            )
        return department_repository.create(db, obj_in=department_in)

    @staticmethod
    def update(db: Session, department_id: int, department_in: DepartmentUpdate) -> Department:
        """Update department, validating code uniqueness if modified."""
        db_dept = DepartmentService.get_by_id(db, department_id)
        if department_in.code and department_in.code != db_dept.code:
            existing = department_repository.get_by_code(db, department_in.code)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Department with code '{department_in.code}' already exists"
                )
        return department_repository.update(db, db_obj=db_dept, obj_in=department_in)

    @staticmethod
    def delete(db: Session, department_id: int) -> Department:
        """Delete department by ID."""
        DepartmentService.get_by_id(db, department_id)
        return department_repository.remove(db, id=department_id)
