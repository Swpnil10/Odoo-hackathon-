from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.category import Category
from app.repositories.category import category_repository
from app.schemas.category import CategoryCreate, CategoryUpdate

class CategoryService:
    """Service class for Category operations."""

    @staticmethod
    def get_by_id(db: Session, category_id: int) -> Category:
        """Fetch category by ID or raise HTTP 404."""
        db_cat = category_repository.get(db, category_id)
        if not db_cat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with ID {category_id} not found"
            )
        return db_cat

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Category]:
        """Fetch multiple categories."""
        return category_repository.get_multi(db, skip=skip, limit=limit)

    @staticmethod
    def create(db: Session, category_in: CategoryCreate) -> Category:
        """Create category, validating name uniqueness."""
        existing = category_repository.get_by_name(db, category_in.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category with name '{category_in.name}' already exists"
            )
        return category_repository.create(db, obj_in=category_in)

    @staticmethod
    def update(db: Session, category_id: int, category_in: CategoryUpdate) -> Category:
        """Update category, validating name uniqueness if modified."""
        db_cat = CategoryService.get_by_id(db, category_id)
        if category_in.name and category_in.name != db_cat.name:
            existing = category_repository.get_by_name(db, category_in.name)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Category with name '{category_in.name}' already exists"
                )
        return category_repository.update(db, db_obj=db_cat, obj_in=category_in)

    @staticmethod
    def delete(db: Session, category_id: int) -> Category:
        """Delete category by ID."""
        CategoryService.get_by_id(db, category_id)
        return category_repository.remove(db, id=category_id)
