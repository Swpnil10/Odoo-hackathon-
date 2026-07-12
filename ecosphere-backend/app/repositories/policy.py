from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.policy import Policy

class PolicyRepository(BaseRepository[Policy]):
    """PolicyRepository for ESG policies."""
    def get_by_title(self, db: Session, title: str) -> Optional[Policy]:
        """Fetch policy by title."""
        query = select(self.model).where(self.model.title == title)
        return db.scalars(query).first()

    def get_by_status(self, db: Session, status: str, *, skip: int = 0, limit: int = 100) -> List[Policy]:
        """Fetch policies by status."""
        query = select(self.model).where(self.model.status == status).offset(skip).limit(limit)
        return list(db.scalars(query).all())

policy_repository = PolicyRepository(Policy)
