from fastapi import APIRouter
from app.api.v1.departments import router as departments_router
from app.api.v1.emissions import router as emissions_router
from app.api.v1.policies import router as policies_router
from app.api.v1.insights import router as insights_router

api_router = APIRouter()
api_router.include_router(departments_router, prefix="/departments", tags=["departments"])
api_router.include_router(emissions_router, prefix="/emissions", tags=["emissions"])
api_router.include_router(policies_router, prefix="/policies", tags=["policies"])
api_router.include_router(insights_router, prefix="/insights", tags=["insights"])

