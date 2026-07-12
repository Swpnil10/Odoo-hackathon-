from sqlalchemy.orm import Session
from typing import List
from app.models.carbon_transaction import CarbonTransaction
from app.models.department import Department
from app.schemas.carbon_transaction import CarbonTransactionCreate
from app.ml.anomaly_detector import CarbonAnomalyDetector

# Instantiate the anomaly detector
anomaly_detector = CarbonAnomalyDetector()

def get_transactions(db: Session, skip: int = 0, limit: int = 100) -> List[CarbonTransaction]:
    """
    Retrieve all carbon transactions from the database.
    """
    return db.query(CarbonTransaction).offset(skip).limit(limit).all()

def get_transactions_by_department(
    db: Session, department_id: int, skip: int = 0, limit: int = 100
) -> List[CarbonTransaction]:
    """
    Retrieve carbon transactions filtered by department.
    """
    return (
        db.query(CarbonTransaction)
        .filter(CarbonTransaction.department_id == department_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_carbon_transaction(db: Session, transaction_in: CarbonTransactionCreate) -> CarbonTransaction:
    """
    Creates a carbon transaction, running it through the CarbonAnomalyDetector.
    If flagged, is_anomalous is set to True.
    Also updates the corresponding department's total ESG score.
    """
    # 1. Fetch historical carbon transactions for the department (baseline data)
    historical_transactions = (
        db.query(CarbonTransaction)
        .filter(CarbonTransaction.department_id == transaction_in.department_id)
        .all()
    )

    # 2. Check if the incoming transaction is anomalous compared to history
    is_anomalous = anomaly_detector.predict(transaction_in, historical_transactions)

    # 3. Build and persist the new transaction
    db_obj = CarbonTransaction(
        department_id=transaction_in.department_id,
        emission_source=transaction_in.emission_source,
        carbon_amount=transaction_in.carbon_amount,
        is_anomalous=is_anomalous
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)

    # 4. Modify department's aggregate ESG score based on emissions
    department = db.query(Department).filter(Department.id == transaction_in.department_id).first()
    if department:
        # Simple penalty logic: Deduct score based on emission magnitude.
        # Double the deduction if the emission transaction is anomalous.
        penalty = transaction_in.carbon_amount * 0.1
        if is_anomalous:
            penalty *= 2.0
            
        new_esg_score = max(0.0, department.total_esg_score - penalty)
        department.total_esg_score = round(new_esg_score, 2)
        
        db.add(department)
        db.commit()

    return db_obj
