import os
import sys
import json
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.api.v1.insights import parse_insight_context, InsightGenerationRequest

class TestESGInsightsEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_context_parser(self):
        req = InsightGenerationRequest(
            department_name="Engineering",
            env_score=75.0,
            social_score=85.0,
            gov_score=90.0,
            forecasted_carbon=120.5,
            open_compliance_issues=["Anomalous electricity spike", "Missing waste sorting logs"]
        )
        formatted_text = parse_insight_context(req)
        
        self.assertIn("Department: Engineering", formatted_text)
        self.assertIn("Environmental Score: 75.0/100", formatted_text)
        self.assertIn("Social Score: 85.0/100", formatted_text)
        self.assertIn("Governance Score: 90.0/100", formatted_text)
        self.assertIn("Forecasted Carbon Footprint (Upcoming 30 Days): 120.5 kg CO2", formatted_text)
        self.assertIn("- Anomalous electricity spike", formatted_text)
        self.assertIn("- Missing waste sorting logs", formatted_text)
        # Ensure it does not contain curly braces or JSON format
        self.assertNotIn('{"department_name"', formatted_text)

    @patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
    @patch("app.api.v1.insights.OpenAI")
    def test_generate_insights_success(self, mock_openai_class):
        # Set up mock response
        mock_client = MagicMock()
        mock_openai_class.return_value = mock_client
        
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = json.dumps({
            "status_summary": "The Engineering department shows robust governance metrics, but its environmental score is hindered by anomalous electricity spikes.",
            "actionable_recommendations": [
                "Implement smart power meters to monitor consumption.",
                "Review waste sorting guidelines with staff.",
                "Conduct a building energy-efficiency audit."
            ]
        })
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response

        # Request
        payload = {
            "department_name": "Engineering",
            "env_score": 75.0,
            "social_score": 85.0,
            "gov_score": 90.0,
            "forecasted_carbon": 120.5,
            "open_compliance_issues": ["Anomalous electricity spike", "Missing waste sorting logs"]
        }
        response = self.client.post("/api/v1/insights/generate", json=payload)
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("robust governance metrics", data["status_summary"])
        self.assertEqual(len(data["actionable_recommendations"]), 3)
        self.assertEqual(data["actionable_recommendations"][0], "Implement smart power meters to monitor consumption.")

    @patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
    @patch("app.api.v1.insights.OpenAI")
    def test_generate_insights_self_healing_padding(self, mock_openai_class):
        mock_client = MagicMock()
        mock_openai_class.return_value = mock_client
        
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = json.dumps({
            "status_summary": "Summary text",
            "actionable_recommendations": ["Only one recommendation."]
        })
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response

        payload = {
            "department_name": "Sales",
            "env_score": 50.0,
            "social_score": 50.0,
            "gov_score": 50.0,
            "forecasted_carbon": 500.0,
            "open_compliance_issues": []
        }
        response = self.client.post("/api/v1/insights/generate", json=payload)
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["actionable_recommendations"]), 3)
        self.assertEqual(data["actionable_recommendations"][0], "Only one recommendation.")
        self.assertEqual(data["actionable_recommendations"][1], "Optimize energy usage by conducting regular audits.")

    @patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
    @patch("app.api.v1.insights.OpenAI")
    def test_generate_insights_self_healing_truncation(self, mock_openai_class):
        mock_client = MagicMock()
        mock_openai_class.return_value = mock_client
        
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = json.dumps({
            "status_summary": "Summary text",
            "actionable_recommendations": ["R1", "R2", "R3", "R4"]
        })
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response

        payload = {
            "department_name": "Sales",
            "env_score": 50.0,
            "social_score": 50.0,
            "gov_score": 50.0,
            "forecasted_carbon": 500.0,
            "open_compliance_issues": []
        }
        response = self.client.post("/api/v1/insights/generate", json=payload)
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["actionable_recommendations"]), 3)
        self.assertEqual(data["actionable_recommendations"], ["R1", "R2", "R3"])

    def test_generate_insights_validation_limits(self):
        # Env score > 100
        payload = {
            "department_name": "Sales",
            "env_score": 105.0,  # Invalid
            "social_score": 50.0,
            "gov_score": 50.0,
            "forecasted_carbon": 500.0,
            "open_compliance_issues": []
        }
        response = self.client.post("/api/v1/insights/generate", json=payload)
        self.assertEqual(response.status_code, 422)

        # Negative env_score
        payload["env_score"] = -10.0
        response = self.client.post("/api/v1/insights/generate", json=payload)
        self.assertEqual(response.status_code, 422)

        # Negative carbon
        payload["env_score"] = 50.0
        payload["forecasted_carbon"] = -50.0
        response = self.client.post("/api/v1/insights/generate", json=payload)
        self.assertEqual(response.status_code, 422)

    @patch.dict(os.environ, {}, clear=True)
    def test_generate_insights_missing_api_key(self):
        payload = {
            "department_name": "HR",
            "env_score": 80.0,
            "social_score": 80.0,
            "gov_score": 80.0,
            "forecasted_carbon": 10.0,
            "open_compliance_issues": []
        }
        response = self.client.post("/api/v1/insights/generate", json=payload)
        self.assertEqual(response.status_code, 500)
        self.assertIn("OPENAI_API_KEY environment variable is not configured", response.json()["detail"])

    @patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
    @patch("app.api.v1.insights.OpenAI")
    def test_generate_insights_api_timeout(self, mock_openai_class):
        import openai
        import httpx
        mock_client = MagicMock()
        mock_openai_class.return_value = mock_client
        
        mock_request = httpx.Request("POST", "https://api.openai.com/v1/chat/completions")
        mock_client.chat.completions.create.side_effect = openai.APITimeoutError(
            request=mock_request
        )

        payload = {
            "department_name": "HR",
            "env_score": 80.0,
            "social_score": 80.0,
            "gov_score": 80.0,
            "forecasted_carbon": 10.0,
            "open_compliance_issues": []
        }
        response = self.client.post("/api/v1/insights/generate", json=payload)
        self.assertEqual(response.status_code, 504)
        self.assertIn("service timed out waiting for OpenAI API", response.json()["detail"])

if __name__ == "__main__":
    unittest.main()
