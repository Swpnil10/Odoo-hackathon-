from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.config import settings
from app.utils.logging import setup_logging, logger
from app.database.session import engine, Base
from app.middleware.exception_handler import setup_exception_handlers
from app.api.api import api_router

# Configure Logging
setup_logging()

# Create tables automatically on startup in development mode.
# This makes local verification and hackathon deployments extremely seamless.
if settings.ENVIRONMENT == "development":
    logger.info("Development mode detected. Syncing database schemas...")
    try:
        from app.database import base  # noqa
        Base.metadata.create_all(bind=engine)
        logger.info("Database schemas synced successfully.")
    except Exception as e:
        logger.error(f"Error creating database tables at startup: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="EcoSphere ESG Management Platform backend API foundation",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Mount CORS Middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Centralized error mapping
setup_exception_handlers(app)

# Register central routers
app.include_router(api_router, prefix=settings.API_V1_STR)

import os
from fastapi.responses import HTMLResponse

@app.get("/", response_class=HTMLResponse, tags=["Dashboard Client"])
def read_dashboard() -> HTMLResponse:
    """Serves the Single Page Application Dashboard Client."""
    template_path = os.path.join(os.path.dirname(__file__), "templates", "dashboard.html")
    if not os.path.exists(template_path):
        return HTMLResponse("<h1>EcoSphere Dashboard Client template not found!</h1>", status_code=404)
    with open(template_path, "r", encoding="utf-8") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content, status_code=200)

@app.get("/health", tags=["Health Check"])
def health_check() -> dict:
    """Check API and environment status."""
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }
