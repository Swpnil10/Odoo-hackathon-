from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentUpdate

def get_departments(db: Session, skip: int = 0, limit: int = 100) -> List[Department]:
    """
    Retrieve list of departments.
    """
    return db.query(Department).offset(skip).limit(limit).all()

def get_department(db: Session, department_id: int) -> Optional[Department]:
    """
    Retrieve a specific department by ID.
    """
    return db.query(Department).filter(Department.id == department_id).first()

def get_department_by_code(db: Session, code: str) -> Optional[Department]:
    """
    Retrieve a department by its unique code.
    """
    return db.query(Department).filter(Department.code == code).first()

def create_department(db: Session, department_in: DepartmentCreate) -> Department:
    """
    Create a new department in the database.
    """
    total = round((department_in.environmental_score + department_in.social_score + department_in.governance_score) / 3.0, 2)
    db_obj = Department(
        name=department_in.name,
        code=department_in.code,
        environmental_score=department_in.environmental_score,
        social_score=department_in.social_score,
        governance_score=department_in.governance_score,
        employee_count=department_in.employee_count,
        total_esg_score=total
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_department(db: Session, department_id: int, department_in: DepartmentUpdate) -> Optional[Department]:
    """
    Update an existing department.
    """
    db_obj = get_department(db, department_id)
    if not db_obj:
        return None
        
    update_data = department_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
        
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_department(db: Session, department_id: int) -> bool:
    """
    Delete a department from the database.
    """
    db_obj = get_department(db, department_id)
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True
