from fastapi import APIRouter
from app.api import auth, category, department, policy, ai, demo

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(department.router, prefix="/departments", tags=["Departments"])
api_router.include_router(category.router, prefix="/categories", tags=["Categories"])
api_router.include_router(policy.router, prefix="/policies", tags=["ESG Policies"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Integration"])
api_router.include_router(demo.router, prefix="/demo", tags=["Demo Management"])
