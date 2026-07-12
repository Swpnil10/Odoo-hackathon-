import os
import sys
import json
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

class TestPoliciesSummarizer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    @patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
    @patch("app.api.v1.policies.OpenAI")
    def test_summarize_success(self, mock_openai_class):
        # Set up mock response
        mock_client = MagicMock()
        mock_openai_class.return_value = mock_client
        
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = json.dumps({
            "summary_bullets": [
                "Turn off unused electrical appliances.",
                "Recycle all manufacturing waste paper.",
                "Report water leakages to maintenance immediately."
            ]
        })
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response

        # Request
        payload = {"policy_text": "This is a long ESG policy document containing details about energy conservation..."}
        response = self.client.post("/api/v1/policies/summarize", json=payload)
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["summary_bullets"]), 3)
        self.assertEqual(data["summary_bullets"][0], "Turn off unused electrical appliances.")
        self.assertEqual(data["summary_bullets"][1], "Recycle all manufacturing waste paper.")
        self.assertEqual(data["summary_bullets"][2], "Report water leakages to maintenance immediately.")

        # Verify chat completion parameters
        mock_client.chat.completions.create.assert_called_once()
        kwargs = mock_client.chat.completions.create.call_args[1]
        self.assertEqual(kwargs["model"], "gpt-4o-mini")
        self.assertEqual(kwargs["response_format"], {"type": "json_object"})

    @patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
    @patch("app.api.v1.policies.OpenAI")
    def test_summarize_self_healing_padding(self, mock_openai_class):
        # Set up mock response with only 2 bullets
        mock_client = MagicMock()
        mock_openai_class.return_value = mock_client
        
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = json.dumps({
            "summary_bullets": [
                "Recycle plastics.",
                "Reduce water usage."
            ]
        })
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response

        payload = {"policy_text": "Short policy"}
        response = self.client.post("/api/v1/policies/summarize", json=payload)
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["summary_bullets"]), 3)
        self.assertEqual(data["summary_bullets"][0], "Recycle plastics.")
        self.assertEqual(data["summary_bullets"][1], "Reduce water usage.")
        self.assertEqual(data["summary_bullets"][2], "Read the full policy document to ensure general compliance.")

    @patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
    @patch("app.api.v1.policies.OpenAI")
    def test_summarize_self_healing_truncation(self, mock_openai_class):
        # Set up mock response with 4 bullets
        mock_client = MagicMock()
        mock_openai_class.return_value = mock_client
        
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = json.dumps({
            "summary_bullets": ["B1", "B2", "B3", "B4"]
        })
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response

        payload = {"policy_text": "Short policy"}
        response = self.client.post("/api/v1/policies/summarize", json=payload)
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["summary_bullets"]), 3)
        self.assertEqual(data["summary_bullets"], ["B1", "B2", "B3"])

    @patch.dict(os.environ, {}, clear=True)
    def test_summarize_missing_api_key(self):
        payload = {"policy_text": "Valid policy text"}
        response = self.client.post("/api/v1/policies/summarize", json=payload)
        self.assertEqual(response.status_code, 500)
        self.assertIn("OPENAI_API_KEY environment variable is not configured", response.json()["detail"])

    def test_summarize_empty_policy(self):
        payload = {"policy_text": "   "}
        response = self.client.post("/api/v1/policies/summarize", json=payload)
        self.assertEqual(response.status_code, 422)
        self.assertIn("Policy text cannot be empty", response.json()["detail"])

    @patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
    @patch("app.api.v1.policies.OpenAI")
    def test_summarize_api_timeout(self, mock_openai_class):
        import openai
        import httpx
        mock_client = MagicMock()
        mock_openai_class.return_value = mock_client
        
        mock_request = httpx.Request("POST", "https://api.openai.com/v1/chat/completions")
        mock_client.chat.completions.create.side_effect = openai.APITimeoutError(
            request=mock_request
        )

        payload = {"policy_text": "Time out test"}
        response = self.client.post("/api/v1/policies/summarize", json=payload)
        self.assertEqual(response.status_code, 504)
        self.assertIn("service timed out waiting for OpenAI API", response.json()["detail"])

    @patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"})
    @patch("app.api.v1.policies.OpenAI")
    def test_summarize_api_connection_error(self, mock_openai_class):
        import openai
        import httpx
        mock_client = MagicMock()
        mock_openai_class.return_value = mock_client
        
        mock_request = httpx.Request("POST", "https://api.openai.com/v1/chat/completions")
        mock_client.chat.completions.create.side_effect = openai.APIConnectionError(
            request=mock_request
        )

        payload = {"policy_text": "Connection test"}
        response = self.client.post("/api/v1/policies/summarize", json=payload)
        self.assertEqual(response.status_code, 502)
        self.assertIn("OpenAI API error", response.json()["detail"])

if __name__ == "__main__":
    unittest.main()
