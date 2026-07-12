from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db
from app.schemas.carbon_transaction import CarbonTransactionCreate, CarbonTransactionResponse
from app.services import emissions_service, departments_service

router = APIRouter()

@router.post("/", response_model=CarbonTransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(transaction_in: CarbonTransactionCreate, db: Session = Depends(get_db)):
    """
    Post a new carbon transaction. Runs the transaction through the CarbonAnomalyDetector before saving.
    """
    # Ensure department exists first to prevent foreign key errors
    dept = departments_service.get_department(db, department_id=transaction_in.department_id)
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with ID {transaction_in.department_id} does not exist."
        )
    return emissions_service.create_carbon_transaction(db, transaction_in=transaction_in)

@router.get("/department/{department_id}", response_model=List[CarbonTransactionResponse])
def read_transactions_by_department(
    department_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """
    Get all carbon transactions for a specific department.
    """
    dept = departments_service.get_department(db, department_id=department_id)
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with ID {department_id} does not exist."
        )
    return emissions_service.get_transactions_by_department(
        db, department_id=department_id, skip=skip, limit=limit
    )

@router.get("/", response_model=List[CarbonTransactionResponse])
def read_all_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Get all carbon transactions.
    """
    return emissions_service.get_transactions(db, skip=skip, limit=limit)
