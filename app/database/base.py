# Import all models to ensure they are registered on the Base metadata.
# This is required for Alembic to autogenerate migrations correctly.
from app.database.session import Base  # noqa
from app.models.user import User  # noqa
from app.models.department import Department  # noqa
from app.models.category import Category  # noqa
from app.models.policy import Policy  # noqa
