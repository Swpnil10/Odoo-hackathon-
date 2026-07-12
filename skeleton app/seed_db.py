import datetime
import os
import sys

# Add parent path to import app correctly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine
from app.models.base import Base
from app.models.department import Department
from app.models.carbon_transaction import CarbonTransaction
from app.models.user import User
from app.core.security import get_password_hash

def seed():
    print("Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("Recreating database tables with new schemas...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    
    # 1. Add departments matching frontend expectations
    departments_data = [
        {"name": "Engineering", "code": "DEPT-ENG", "environmental_score": 84.0, "social_score": 76.0, "governance_score": 90.0, "employee_count": 120},
        {"name": "Sales & Marketing", "code": "DEPT-SALES", "environmental_score": 62.0, "social_score": 88.0, "governance_score": 72.0, "employee_count": 85},
        {"name": "Operations", "code": "DEPT-OPS", "environmental_score": 78.0, "social_score": 65.0, "governance_score": 82.0, "employee_count": 50},
        {"name": "Human Resources", "code": "DEPT-HR", "environmental_score": 70.0, "social_score": 92.0, "governance_score": 88.0, "employee_count": 30},
        {"name": "Finance & Legal", "code": "DEPT-FIN", "environmental_score": 55.0, "social_score": 72.0, "governance_score": 96.0, "employee_count": 25}
    ]

    departments = []
    print("Inserting departments...")
    for d_data in departments_data:
        total = round((d_data["environmental_score"] + d_data["social_score"] + d_data["governance_score"]) / 3.0, 2)
        dept = Department(
            name=d_data["name"],
            code=d_data["code"],
            environmental_score=d_data["environmental_score"],
            social_score=d_data["social_score"],
            governance_score=d_data["governance_score"],
            employee_count=d_data["employee_count"],
            total_esg_score=total
        )
        db.add(dept)
        db.commit()
        db.refresh(dept)
        departments.append(dept)

    # 2. Add some carbon transactions to seed trends
    # For each department, add 5 transactions spanning 5 days
    # We want to create distinct trends:
    # - Engineering: Increasing trend (10, 20, 30, 40, 50)
    # - Sales: Decreasing trend (80, 70, 60, 50, 40)
    # - Others: Stable trend (30, 30, 30, 30, 30)
    base_date = datetime.datetime.now(datetime.timezone.utc)
    print("Inserting carbon transactions...")
    for dept in departments:
        for i in range(5):
            date = base_date - datetime.timedelta(days=(4 - i))
            if dept.code == "DEPT-ENG":
                amount = 10.0 * (i + 1)
            elif dept.code == "DEPT-SALES":
                amount = 80.0 - 10.0 * i
            else:
                amount = 30.0

            tx = CarbonTransaction(
                department_id=dept.id,
                emission_source="Manufacturing" if dept.code == "DEPT-ENG" else "Fleet",
                carbon_amount=amount,
                transaction_date=date,
                is_anomalous=False
            )
            db.add(tx)
    
    # 3. Add default users
    print("Inserting default user credentials...")
    default_users = [
        {"email": "admin@ecosphere.com", "password": "adminpassword", "role": "admin"},
        {"email": "employee@ecosphere.com", "password": "employeepassword", "role": "employee"}
    ]
    for u_data in default_users:
        hashed = get_password_hash(u_data["password"])
        user = User(
            email=u_data["email"],
            hashed_password=hashed,
            role=u_data["role"],
            is_active=True
        )
        db.add(user)

    db.commit()
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed()
