from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.category import Category

class CategoryRepository(BaseRepository[Category]):
    """CategoryRepository for categories."""
    def get_by_name(self, db: Session, name: str) -> Optional[Category]:
        """Fetch category by name."""
        query = select(self.model).where(self.model.name == name)
        return db.scalars(query).first()

category_repository = CategoryRepository(Category)
