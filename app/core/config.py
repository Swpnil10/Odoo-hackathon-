from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "EcoSphere ESG Management Platform"
    
    # Database URL: defaults to local SQLite, but can be overridden with a PostgreSQL URL
    DATABASE_URL: str = "sqlite:///./ecosphere.db"
    
    # ML settings
    MIN_TRAINING_SAMPLES: int = 5
    
    model_config = ConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
