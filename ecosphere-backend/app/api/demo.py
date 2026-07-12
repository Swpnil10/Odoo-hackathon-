from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.utils.deps import get_db
from app.repositories.user import user_repository
from app.repositories.department import department_repository
from app.repositories.category import category_repository
from app.repositories.policy import policy_repository
from app.services.auth import AuthService
from app.models.user import UserRole

router = APIRouter()

@router.post("/seed", status_code=status.HTTP_200_OK)
def seed_demo_data(db: Session = Depends(get_db)) -> dict:
    """
    Seeds the EcoSphere database with realistic, high-quality enterprise demo data.
    Creates default roles, departments, ESG policies, and CSR categories.
    Idempotent: skips seeding for records that already exist.
    """
    # 1. Seed Users (Admin, Manager, Employee)
    users_data = [
        {"email": "admin@ecosphere.com", "password": "adminpassword", "role": UserRole.ADMIN},
        {"email": "manager@ecosphere.com", "password": "managerpassword", "role": UserRole.MANAGER},
        {"email": "employee@ecosphere.com", "password": "employeepassword", "role": UserRole.EMPLOYEE},
    ]
    seeded_users = []
    for user_info in users_data:
        existing = user_repository.get_by_email(db, email=user_info["email"])
        if not existing:
            hashed_pwd = AuthService.get_password_hash(user_info["password"])
            db_user = user_repository.create(db, obj_in={
                "email": user_info["email"],
                "hashed_password": hashed_pwd,
                "role": user_info["role"],
                "is_active": True
            })
            seeded_users.append(db_user.email)
            
    # 2. Seed Departments
    depts_data = [
        {"name": "Operations", "code": "OPS-01", "head": "Marcus Vance", "parent_department": None, "employee_count": 120, "status": "active"},
        {"name": "Engineering", "code": "ENG-02", "head": "Dr. Aris Thorne", "parent_department": None, "employee_count": 85, "status": "active"},
        {"name": "Human Resources", "code": "HR-03", "head": "Clara Dupont", "parent_department": None, "employee_count": 32, "status": "active"},
        {"name": "Sales & Marketing", "code": "SLS-04", "head": "Elena Rostova", "parent_department": None, "employee_count": 54, "status": "active"},
        {"name": "Logistics", "code": "LOG-05", "head": "Jean-Louis Moreau", "parent_department": None, "employee_count": 45, "status": "active"},
    ]
    seeded_depts = []
    for dept_info in depts_data:
        existing = department_repository.get_by_code(db, code=dept_info["code"])
        if not existing:
            db_dept = department_repository.create(db, obj_in=dept_info)
            seeded_depts.append(db_dept.name)
            
    # 3. Seed Categories
    cats_data = [
        {"name": "Carbon Neutrality Challenge", "type": "Challenge", "status": "active"},
        {"name": "Offices Energy-Saving Campaign", "type": "CSR Activity", "status": "active"},
        {"name": "E-Waste Recycling Campaign", "type": "CSR Activity", "status": "active"},
        {"name": "Commute Reduction Challenge", "type": "Challenge", "status": "active"},
        {"name": "Zero Single-Use Plastic Week", "type": "Challenge", "status": "active"},
    ]
    seeded_cats = []
    for cat_info in cats_data:
        existing = category_repository.get_by_name(db, name=cat_info["name"])
        if not existing:
            db_cat = category_repository.create(db, obj_in=cat_info)
            seeded_cats.append(db_cat.name)
            
    # 4. Seed Policies
    policies_data = [
        {
            "title": "Green Commute Directive",
            "description": "Corporate guidelines encouraging employees to walk, bike, carpool, or take public transit to lower Scope 3 greenhouse gas emissions. Offers transit reimbursement and bike lockers.",
            "document_url": "https://ecosphere.com/policies/green-commute.pdf",
            "version": "1.0",
            "status": "active"
        },
        {
            "title": "Paperless Office Guidelines",
            "description": "Sets limits on printing, promotes electronic signatures and digitizing files using cloud infrastructure to cut paper usage and waste.",
            "document_url": "https://ecosphere.com/policies/paperless-office.pdf",
            "version": "1.0",
            "status": "active"
        },
        {
            "title": "Zero Single-Use Plastics Code",
            "description": "Bans single-use plastic cups, water bottles, and cutlery in all corporate offices by 2027. Encourages reusable mug usage.",
            "document_url": "https://ecosphere.com/policies/zero-plastic.pdf",
            "version": "1.1",
            "status": "draft"
        }
    ]
    seeded_pols = []
    for pol_info in policies_data:
        existing = policy_repository.get_by_title(db, title=pol_info["title"])
        if not existing:
            db_pol = policy_repository.create(db, obj_in=pol_info)
            seeded_pols.append(db_pol.title)
            
    return {
        "success": True,
        "message": "Demo data seeded successfully.",
        "seeded": {
            "users": seeded_users,
            "departments": seeded_depts,
            "categories": seeded_cats,
            "policies": seeded_pols
        }
    }
