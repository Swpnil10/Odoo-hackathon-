from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from app.services import departments_service

router = APIRouter()

@router.get("/", response_model=List[DepartmentResponse])
def read_departments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all departments.
    """
    return departments_service.get_departments(db, skip=skip, limit=limit)

@router.post("/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(department_in: DepartmentCreate, db: Session = Depends(get_db)):
    """
    Create a new department.
    """
    db_dept = departments_service.get_department_by_code(db, code=department_in.code)
    if db_dept:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department with this code already exists."
        )
    return departments_service.create_department(db, department_in=department_in)

@router.get("/{department_id}", response_model=DepartmentResponse)
def read_department(department_id: int, db: Session = Depends(get_db)):
    """
    Get a department by ID.
    """
    db_dept = departments_service.get_department(db, department_id=department_id)
    if not db_dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found."
        )
    return db_dept

@router.put("/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: int, department_in: DepartmentUpdate, db: Session = Depends(get_db)
):
    """
    Update an existing department.
    """
    db_dept = departments_service.update_department(db, department_id=department_id, department_in=department_in)
    if not db_dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found."
        )
    return db_dept

@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(department_id: int, db: Session = Depends(get_db)):
    """
    Delete a department.
    """
    success = departments_service.delete_department(db, department_id=department_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found."
        )
    return
