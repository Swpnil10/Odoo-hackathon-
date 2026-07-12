from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine
from app.models.base import Base
from app.api.v1 import api_router

# Initialize database tables automatically for immediate developer/sandbox use.
# For production deployments, migrations are managed via Alembic.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="EcoSphere: Foundational ESG Management Platform Backend with ML Anomaly Detection.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for frontend dashboard connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include core API routers (Departments, Emissions) under /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME} API!",
        "docs_url": "/docs",
        "api_v1_prefix": settings.API_V1_STR
    }

# ==============================================================================
# INTEGRATION NOTES FOR TEAMMATES:
# ==============================================================================
#
# 1. "GenAI Policy Summarizer" Router Integration:
#    --------------------------------------------------------------------------
#    Teammates working on the LLM policy summaries should:
#    - Step A: Create the file `app/api/v1/policy_summarizer.py`
#    - Step B: Create a service file `app/services/policy_service.py` to handle LLM calls
#              (using google-genai, vertexai, or custom prompts).
#    - Step C: Implement a router in `policy_summarizer.py`:
#              ```python
#              from fastapi import APIRouter, Depends
#              from app.services.policy_service import summarize_pdf_policy
#              router = APIRouter()
#              @router.post("/summarize")
#              def summarize(pdf_url: str):
#                  return summarize_pdf_policy(pdf_url)
#              ```
#    - Step D: Include this new router in `app/api/v1/__init__.py`:
#              ```python
#              from app.api.v1.policy_summarizer import router as policy_router
#              api_router.include_router(policy_router, prefix="/policies", tags=["GenAI Policy Summarizer"])
#              ```
#
# 2. "Gamification/Social" Router Integration:
#    --------------------------------------------------------------------------
#    Teammates working on leaderboard, badges, and social features should:
#    - Step A: Create `app/api/v1/gamification.py`
#    - Step B: Create models (e.g., Badge, Leaderboard) in `app/models/gamification.py`
#              and import them in `app/models/__init__.py`.
#    - Step C: Implement endpoints in `gamification.py` like:
#              - GET `/leaderboard` (retrieves departments ranked by total_esg_score)
#              - GET `/badges` (retrieves badges awarded to a department)
#    - Step D: Include the new router in `app/api/v1/__init__.py`:
#              ```python
#              from app.api.v1.gamification import router as gamification_router
#              api_router.include_router(gamification_router, prefix="/social", tags=["Gamification/Social"])
#              ```
# ==============================================================================
