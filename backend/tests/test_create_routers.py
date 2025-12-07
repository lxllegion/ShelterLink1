from fastapi.testclient import TestClient
from unittest.mock import patch
from main import app

client = TestClient(app)

@patch("routers.forms.save_donation")
def test_create_donation(mock_save):
    # Mock the service return
    mock_save.return_value = {"success": True, "id": "D1"}

    # based on DonationForm schema
    payload = {
        "donor_id": "DONOR1",
        "item_name": "Apples",
        "quantity": 5,
        "category": "Food"
    }

    response = client.post("/forms/donation", json=payload)

    assert response.status_code == 200
    assert response.json() == {"success": True, "id": "D1"}

    mock_save.assert_called_once()

@patch("routers.forms.save_request")
def test_create_request(mock_save):
    # Mock the service return
    mock_save.return_value = {"success": True, "id": "R1"}

    # based on RequestForm schema
    payload = {
        "shelter_id": "SHELTER1",
        "item_name": "Pants",
        "quantity": 10,
        "category": "Clothing"
    }

    response = client.post("/forms/request", json=payload)

    assert response.status_code == 200
    assert response.json() == {"success": True, "id": "R1"}

    mock_save.assert_called_once()