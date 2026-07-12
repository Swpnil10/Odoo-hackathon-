import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class CarbonTransaction(Base):
    __tablename__ = "carbon_transactions"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    emission_source = Column(String, nullable=False, index=True)  # e.g., Fleet, Manufacturing
    carbon_amount = Column(Float, nullable=False)
    transaction_date = Column(
        DateTime(timezone=True), 
        default=lambda: datetime.datetime.now(datetime.timezone.utc), 
        nullable=False
    )
    is_anomalous = Column(Boolean, default=False, nullable=False)

    # Establish relation back to Department
    department = relationship("Department", back_populates="transactions")
