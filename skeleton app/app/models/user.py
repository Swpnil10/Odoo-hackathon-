from sqlalchemy import Column, Integer, String, Boolean
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="employee", nullable=False)  # 'employee' or 'admin'
    is_active = Column(Boolean, default=True, nullable=False)
    xp = Column(Integer, default=0, nullable=False)
