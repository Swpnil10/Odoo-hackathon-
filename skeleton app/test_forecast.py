import os
import sys
import unittest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.api.deps import get_db
from app.models.base import Base
from app.models.department import Department
from app.models.carbon_transaction import CarbonTransaction
from app.ml.emission_predictor import CarbonPredictor

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup test database
TEST_DB_FILE = "test_emissions.db"
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

class TestCarbonEmissionsForecast(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create test tables
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        # Drop test tables and clean up DB file
        Base.metadata.drop_all(bind=engine)
        if os.path.exists(TEST_DB_FILE):
            try:
                os.remove(TEST_DB_FILE)
            except OSError:
                pass

    def setUp(self):
        # Clear database before each test
        self.db = TestingSessionLocal()
        self.db.query(CarbonTransaction).delete()
        self.db.query(Department).delete()
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_predictor_empty_transactions(self):
        predictor = CarbonPredictor()
        res = predictor.predict_next_30_days([])
        self.assertEqual(res["forecasted_carbon_amount"], 0.0)
        self.assertEqual(res["trend"], "stable")

    def test_predictor_fallback_few_points(self):
        predictor = CarbonPredictor()
        
        # Test 1 point
        t1 = CarbonTransaction(carbon_amount=50.0, transaction_date=datetime.now())
        res = predictor.predict_next_30_days([t1])
        self.assertEqual(res["forecasted_carbon_amount"], 50.0)
        self.assertEqual(res["trend"], "stable")

        # Test 2 points
        t2 = CarbonTransaction(carbon_amount=70.0, transaction_date=datetime.now() - timedelta(days=1))
        res = predictor.predict_next_30_days([t1, t2])
        self.assertEqual(res["forecasted_carbon_amount"], 60.0)
        self.assertEqual(res["trend"], "stable")

    def test_predictor_increasing_trend(self):
        predictor = CarbonPredictor()
        
        # Construct an increasing trend over 5 days: 10, 20, 30, 40, 50
        base_date = datetime.now() - timedelta(days=10)
        txs = []
        for i in range(5):
            txs.append(CarbonTransaction(
                carbon_amount=10.0 * (i + 1),
                transaction_date=base_date + timedelta(days=i)
            ))
            
        res = predictor.predict_next_30_days(txs)
        # linear regression should match a trend line with positive slope
        self.assertEqual(res["trend"], "increasing")
        # predicted emissions should be positive and greater than 0
        self.assertGreater(res["forecasted_carbon_amount"], 0)

    def test_predictor_decreasing_trend(self):
        predictor = CarbonPredictor()
        
        # Construct a decreasing trend over 5 days: 100, 90, 80, 70, 60
        base_date = datetime.now() - timedelta(days=10)
        txs = []
        for i in range(5):
            txs.append(CarbonTransaction(
                carbon_amount=100.0 - 10.0 * i,
                transaction_date=base_date + timedelta(days=i)
            ))
            
        res = predictor.predict_next_30_days(txs)
        self.assertEqual(res["trend"], "decreasing")
        self.assertGreaterEqual(res["forecasted_carbon_amount"], 0)

    def test_api_forecast_not_found(self):
        # Request non-existent department ID
        response = self.client.get("/api/v1/emissions/999/forecast")
        self.assertEqual(response.status_code, 404)
        self.assertIn("does not exist", response.json()["detail"])

    def test_api_forecast_fallback(self):
        # Create department
        dept = Department(name="IT", code="DEPT-IT", total_esg_score=100.0)
        self.db.add(dept)
        self.db.commit()
        self.db.refresh(dept)

        # Create 2 transactions (less than 3, should trigger fallback)
        tx1 = CarbonTransaction(department_id=dept.id, emission_source="Fleet", carbon_amount=15.0, transaction_date=datetime.now() - timedelta(days=1))
        tx2 = CarbonTransaction(department_id=dept.id, emission_source="Manufacturing", carbon_amount=25.0, transaction_date=datetime.now())
        self.db.add(tx1)
        self.db.add(tx2)
        self.db.commit()

        # Call endpoint
        response = self.client.get(f"/api/v1/emissions/{dept.id}/forecast")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["department_id"], dept.id)
        # (15 + 25) / 2 = 20.0
        self.assertEqual(data["forecasted_carbon_amount"], 20.0)
        self.assertEqual(data["trend"], "stable")

    def test_api_forecast_linear_regression(self):
        # Create department
        dept = Department(name="Operations", code="DEPT-OPS", total_esg_score=100.0)
        self.db.add(dept)
        self.db.commit()
        self.db.refresh(dept)

        # Create 5 transactions (daily increasing)
        base_date = datetime.now() - timedelta(days=10)
        for i in range(5):
            tx = CarbonTransaction(
                department_id=dept.id,
                emission_source="Manufacturing",
                carbon_amount=10.0 * (i + 1),
                transaction_date=base_date + timedelta(days=i)
            )
            self.db.add(tx)
        self.db.commit()

        # Call endpoint
        response = self.client.get(f"/api/v1/emissions/{dept.id}/forecast")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["department_id"], dept.id)
        self.assertEqual(data["trend"], "increasing")
        self.assertGreater(data["forecasted_carbon_amount"], 0)

if __name__ == "__main__":
    unittest.main()
