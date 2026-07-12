from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.database.session import Base

class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)  # "CSR Activity" or "Challenge"
    status: Mapped[str] = mapped_column(String, default="active", nullable=False)
