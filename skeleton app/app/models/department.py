from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.models.base import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    code = Column(String, unique=True, nullable=False, index=True)
    total_esg_score = Column(Float, default=0.0, nullable=False)

    # Establish relation to carbon transactions
    transactions = relationship("CarbonTransaction", back_populates="department", cascade="all, delete-orphan")
