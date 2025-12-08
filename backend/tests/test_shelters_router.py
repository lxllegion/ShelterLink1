from fastapi.testclient import TestClient
from unittest.mock import patch
from main import app

client = TestClient(app)


@patch("routers.shelters.get_all_shelters_service")
def test_get_all_shelters_success(mock_service):
    """Test successful retrieval of all shelters"""
    mock_service.return_value = {
        "shelters": [
            {
                "userID": "S001",
                "shelter_name": "Hope Shelter",
                "email": "hope@example.com",
                "phone_number": "123-456-7890",
                "city": "Seattle"
            },
            {
                "userID": "S002",
                "shelter_name": "Safe Haven",
                "email": "safe@example.com",
                "phone_number": "098-765-4321",
                "city": "Portland"
            }
        ]
    }

    response = client.get("/shelters/")

    assert response.status_code == 200
    data = response.json()
    assert "shelters" in data
    assert len(data["shelters"]) == 2
    assert data["shelters"][0]["shelter_name"] == "Hope Shelter"


@patch("routers.shelters.get_all_shelters_service")
def test_get_all_shelters_empty(mock_service):
    """Test retrieval when no shelters exist"""
    mock_service.return_value = {"shelters": []}

    response = client.get("/shelters/")

    assert response.status_code == 200
    data = response.json()
    assert data["shelters"] == []


@patch("routers.shelters.get_all_shelters_service")
def test_get_all_shelters_error(mock_service):
    """Test error handling when service fails"""
    mock_service.return_value = {"error": "Database connection failed"}

    response = client.get("/shelters/")

    assert response.status_code == 500
    assert "Database connection failed" in response.json()["detail"]


@patch("routers.shelters.get_shelter_requests_service")
def test_get_shelter_requests_success(mock_service):
    """Test successful retrieval of shelter requests"""
    mock_service.return_value = {
        "requests": [
            {
                "request_id": "R001",
                "shelter_id": "S001",
                "item_name": "Blankets",
                "quantity": 10,
                "category": "Bedding"
            }
        ]
    }

    response = client.get("/shelters/S001/requests")

    assert response.status_code == 200
    data = response.json()
    assert "requests" in data
    assert len(data["requests"]) == 1
    assert data["requests"][0]["item_name"] == "Blankets"


@patch("routers.shelters.get_shelter_requests_service")
def test_get_shelter_requests_empty(mock_service):
    """Test retrieval when shelter has no requests"""
    mock_service.return_value = {"requests": []}

    response = client.get("/shelters/S001/requests")

    assert response.status_code == 200
    data = response.json()
    assert data["requests"] == []


@patch("routers.shelters.get_shelter_requests_service")
def test_get_shelter_requests_error(mock_service):
    """Test error handling for shelter requests"""
    mock_service.return_value = {"error": "Shelter not found"}

    response = client.get("/shelters/INVALID/requests")

    assert response.status_code == 500
    assert "Shelter not found" in response.json()["detail"]

