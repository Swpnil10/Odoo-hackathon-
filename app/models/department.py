from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.database.session import Base

class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    code: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    head: Mapped[str] = mapped_column(String, nullable=True)
    parent_department: Mapped[str] = mapped_column(String, nullable=True)
    employee_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String, default="active", nullable=False)
