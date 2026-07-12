from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "EcoSphere ESG Management Platform"
    
    # Database URL: defaults to local SQLite, but can be overridden with a PostgreSQL URL
    DATABASE_URL: str = "sqlite:///./ecosphere.db"
    
    # ML settings
    MIN_TRAINING_SAMPLES: int = 5
    
    # JWT security settings
    SECRET_KEY: str = "SUPER_SECRET_ESG_KEY_ODOO_HACKATHON"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # SMTP settings must be declared BEFORE model_config
    SMTP_SERVER: str | None = None
    SMTP_PORT: int | None = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None

    # Use SettingsConfigDict for BaseSettings in Pydantic V2
    model_config = SettingsConfigDict(
        case_sensitive=True, 
        env_file=".env",
        extra="ignore"
    )

settings = Settings()