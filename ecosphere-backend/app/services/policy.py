from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.policy import Policy
from app.repositories.policy import policy_repository
from app.schemas.policy import PolicyCreate, PolicyUpdate

class PolicyService:
    """Service class for Policy operations."""

    @staticmethod
    def get_by_id(db: Session, policy_id: int) -> Policy:
        """Fetch policy by ID or raise HTTP 404."""
        db_policy = policy_repository.get(db, policy_id)
        if not db_policy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Policy with ID {policy_id} not found"
            )
        return db_policy

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Policy]:
        """Fetch multiple policies."""
        return policy_repository.get_multi(db, skip=skip, limit=limit)

    @staticmethod
    def get_by_status(db: Session, status_str: str, skip: int = 0, limit: int = 100) -> List[Policy]:
        """Fetch policies filtered by status."""
        return policy_repository.get_by_status(db, status=status_str, skip=skip, limit=limit)

    @staticmethod
    def create(db: Session, policy_in: PolicyCreate) -> Policy:
        """Create policy, validating title uniqueness."""
        existing = policy_repository.get_by_title(db, policy_in.title)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Policy with title '{policy_in.title}' already exists"
            )
        return policy_repository.create(db, obj_in=policy_in)

    @staticmethod
    def update(db: Session, policy_id: int, policy_in: PolicyUpdate) -> Policy:
        """Update policy, validating title uniqueness if modified."""
        db_policy = PolicyService.get_by_id(db, policy_id)
        if policy_in.title and policy_in.title != db_policy.title:
            existing = policy_repository.get_by_title(db, policy_in.title)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Policy with title '{policy_in.title}' already exists"
                )
        return policy_repository.update(db, db_obj=db_policy, obj_in=policy_in)

    @staticmethod
    def delete(db: Session, policy_id: int) -> Policy:
        """Delete policy by ID."""
        PolicyService.get_by_id(db, policy_id)
        return policy_repository.remove(db, id=policy_id)
