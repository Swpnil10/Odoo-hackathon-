from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.user import User

class UserRepository(BaseRepository[User]):
    """UserRepository containing user-specific operations."""
    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        """Retrieve user by email address."""
        query = select(self.model).where(self.model.email == email)
        return db.scalars(query).first()

user_repository = UserRepository(User)
