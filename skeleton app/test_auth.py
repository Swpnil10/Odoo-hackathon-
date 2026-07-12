import os
import sys
import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.api.deps import get_db
from app.models.base import Base
from app.models.user import User

TEST_DB_FILE = "test_auth.db"
TEST_DATABASE_URL = f"sqlite:///./{TEST_DB_FILE}"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

class TestAuthAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=engine)
        if os.path.exists(TEST_DB_FILE):
            try:
                os.remove(TEST_DB_FILE)
            except Exception:
                pass

    def test_auth_flow(self):
        # 1. Signup
        signup_payload = {
            "email": "testuser@ecosphere.com",
            "password": "testpassword",
            "role": "employee"
        }
        response = self.client.post("/api/v1/auth/signup", json=signup_payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["email"], "testuser@ecosphere.com")
        self.assertEqual(response.json()["role"], "employee")

        # 2. Login
        login_payload = {
            "email": "testuser@ecosphere.com",
            "password": "testpassword"
        }
        response = self.client.post("/api/v1/auth/login", json=login_payload)
        self.assertEqual(response.status_code, 200)
        self.assertIn("access_token", response.json())
        self.assertEqual(response.json()["token_type"], "bearer")

        # 3. Login with wrong password
        login_wrong = {
            "email": "testuser@ecosphere.com",
            "password": "wrongpassword"
        }
        response = self.client.post("/api/v1/auth/login", json=login_wrong)
        self.assertEqual(response.status_code, 401)

        # 4. Reset password
        reset_payload = {"email": "testuser@ecosphere.com"}
        response = self.client.post("/api/v1/auth/reset-password", json=reset_payload)
        self.assertEqual(response.status_code, 200)
        self.assertIn("testuser@ecosphere.com", response.json()["message"])

if __name__ == "__main__":
    unittest.main()
