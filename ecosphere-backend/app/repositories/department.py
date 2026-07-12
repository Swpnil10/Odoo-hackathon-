from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.department import Department

class DepartmentRepository(BaseRepository[Department]):
    """DepartmentRepository for department operations."""
    def get_by_code(self, db: Session, code: str) -> Optional[Department]:
        """Fetch department by unique code."""
        query = select(self.model).where(self.model.code == code)
        return db.scalars(query).first()

department_repository = DepartmentRepository(Department)
