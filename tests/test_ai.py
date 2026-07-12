import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from fastapi import status

# Ensure we import base app
from app.main import app
from app.ai.gemini import GeminiService, AIValidationError, AIAPIError, AIRateLimitError
from app.utils.deps import get_current_user
from app.models.user import User

client = TestClient(app)

def test_policy_summary_validation() -> None:
    """Verifies that summarizer service throws exception on invalid or short policy inputs."""
    service = GeminiService(api_key="mock_key")
    
    # Empty text check
    with pytest.raises(AIValidationError):
        service.summarize_policy("")
        
    # Short text check
    with pytest.raises(AIValidationError):
        service.summarize_policy("short")

def test_esg_insights_validation() -> None:
    """Verifies that insights engine throws exception on empty metrics inputs."""
    service = GeminiService(api_key="mock_key")
    with pytest.raises(AIValidationError):
        service.generate_esg_insights({})

@patch("app.ai.gemini.genai.Client")
def test_mock_gemini_summarizer_success(mock_genai_client_class: MagicMock) -> None:
    """Mocks Gemini generate_content to verify prompt output parsing and validation."""
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = '{"summary": ["Employee Action 1", "Employee Action 2", "Employee Action 3"]}'
    mock_response.usage_metadata = MagicMock(prompt_token_count=10, candidates_token_count=20)
    mock_client.models.generate_content.return_value = mock_response
    mock_genai_client_class.return_value = mock_client
    
    service = GeminiService(api_key="real_key")
    service.client = mock_client
    
    bullets = service.summarize_policy("This is a long test policy document detailing company compliance operations.")
    assert len(bullets) == 3
    assert bullets[0] == "Employee Action 1"
    
@patch("app.ai.gemini.genai.Client")
def test_mock_gemini_insights_success(mock_genai_client_class: MagicMock) -> None:
    """Mocks Gemini generate_content to verify ESG insights execution and parsing."""
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = '{"overall_health": "Good", "insight": "### Observation\\nEmissions decreased."}'
    mock_response.usage_metadata = MagicMock(prompt_token_count=15, candidates_token_count=25)
    mock_client.models.generate_content.return_value = mock_response
    mock_genai_client_class.return_value = mock_client
    
    service = GeminiService(api_key="real_key")
    service.client = mock_client
    
    metrics = {
        "department": "Engineering",
        "environment_score": 80,
        "social_score": 85,
        "governance_score": 75,
        "carbon_emission": 150,
        "previous_carbon_emission": 180,
        "csr_participation": 70,
        "pending_compliance": 2
    }
    
    res = service.generate_esg_insights(metrics)
    assert res["overall_health"] == "Good"
    assert "Emissions decreased" in res["insight"]

def test_endpoints_require_auth() -> None:
    """Confirms both AI endpoints return HTTP 401 Unauthorized if no JWT token is supplied."""
    resp = client.post("/api/v1/ai/policy-summary", json={"policy_text": "Long policy text for summarization."})
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
    
    resp = client.post("/api/v1/ai/esg-insights", json={
        "department": "Engineering",
        "environment_score": 80,
        "social_score": 85,
        "governance_score": 75,
        "carbon_emission": 150,
        "previous_carbon_emission": 180,
        "csr_participation": 70,
        "pending_compliance": 2
    })
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    resp = client.post("/api/v1/ai/advisor", json={
        "question": "How to improve score?",
        "department": "Engineering",
        "environment_score": 80,
        "social_score": 85,
        "governance_score": 75,
        "carbon_emission": 150,
        "csr_participation": 70,
        "pending_compliance": 2
    })
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.fixture
def mock_auth_user() -> User:
    """Provides a mock logged-in user by overriding get_current_user dependency."""
    user = User(email="employee@ecosphere.com", role="Employee", is_active=True)
    app.dependency_overrides[get_current_user] = lambda: user
    yield user
    app.dependency_overrides.clear()

def test_endpoints_validation_errors(mock_auth_user: User) -> None:
    """Verifies that endpoints validate fields and return HTTP 422 for invalid requests."""
    # Policy text too short (min length is 10)
    resp = client.post("/api/v1/ai/policy-summary", json={"policy_text": "short"})
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    # Environment score too high (max is 100)
    resp = client.post("/api/v1/ai/esg-insights", json={
        "department": "Engineering",
        "environment_score": 120,  # Invalid
        "social_score": 85,
        "governance_score": 75,
        "carbon_emission": 150,
        "previous_carbon_emission": 180,
        "csr_participation": 70,
        "pending_compliance": 2
    })
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # Advisor question too short (min length is 5)
    resp = client.post("/api/v1/ai/advisor", json={
        "question": "why?", # Too short
        "department": "Engineering",
        "environment_score": 80,
        "social_score": 85,
        "governance_score": 75,
        "carbon_emission": 150,
        "csr_participation": 70,
        "pending_compliance": 2
    })
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

@patch("app.ai.gemini.genai.Client")
def test_mock_gemini_advisor_success(mock_genai_client_class: MagicMock) -> None:
    """Mocks Gemini generate_content to verify ESG advisor responses."""
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = '{"answer": "### Recommendations\\n1. Improve carbon footprint"}'
    mock_response.usage_metadata = MagicMock(prompt_token_count=20, candidates_token_count=40)
    mock_client.models.generate_content.return_value = mock_response
    mock_genai_client_class.return_value = mock_client
    
    service = GeminiService(api_key="real_key")
    service.client = mock_client
    
    metrics = {
        "department": "Logistics",
        "environment_score": 50,
        "social_score": 60,
        "governance_score": 70,
        "carbon_emission": 500,
        "csr_participation": 40,
        "pending_compliance": 8
    }
    
    res = service.generate_sustainability_advice("How can we reduce emissions?", metrics)
    assert "Improve carbon footprint" in res["answer"]
