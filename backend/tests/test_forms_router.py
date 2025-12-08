from fastapi.testclient import TestClient
from unittest.mock import patch
from main import app

client = TestClient(app)


# ========== GET Endpoints ==========

@patch("routers.forms.get_donations")
def test_list_donations_all(mock_get):
    """Test listing all donations"""
    mock_get.return_value = [
        {"donation_id": "D1", "donor_id": "DONOR1", "item_name": "Rice", "quantity": 10, "category": "Food"},
        {"donation_id": "D2", "donor_id": "DONOR2", "item_name": "Shirts", "quantity": 5, "category": "Clothing"}
    ]

    response = client.get("/forms/donations")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    mock_get.assert_called_once_with(user_id=None)


@patch("routers.forms.get_donations")
def test_list_donations_by_user(mock_get):
    """Test listing donations filtered by user_id"""
    mock_get.return_value = [
        {"donation_id": "D1", "donor_id": "DONOR1", "item_name": "Rice", "quantity": 10, "category": "Food"}
    ]

    response = client.get("/forms/donations?user_id=DONOR1")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["donor_id"] == "DONOR1"
    mock_get.assert_called_once_with(user_id="DONOR1")


@patch("routers.forms.get_requests")
def test_list_requests_all(mock_get):
    """Test listing all requests"""
    mock_get.return_value = [
        {"request_id": "R1", "shelter_id": "S1", "item_name": "Blankets", "quantity": 20, "category": "Bedding"}
    ]

    response = client.get("/forms/requests")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    mock_get.assert_called_once_with(user_id=None)


@patch("routers.forms.get_requests")
def test_list_requests_by_user(mock_get):
    """Test listing requests filtered by user_id"""
    mock_get.return_value = [
        {"request_id": "R1", "shelter_id": "S1", "item_name": "Blankets", "quantity": 20, "category": "Bedding"}
    ]

    response = client.get("/forms/requests?user_id=S1")

    assert response.status_code == 200
    mock_get.assert_called_once_with(user_id="S1")


# ========== DELETE Endpoints ==========

@patch("routers.forms.delete_donation_service")
def test_delete_donation_success(mock_delete):
    """Test successful donation deletion"""
    mock_delete.return_value = True

    response = client.delete("/forms/donation/12345678-1234-1234-1234-123456789abc/DONOR1")

    assert response.status_code == 200
    assert response.json()["message"] == "Donation deleted successfully"


@patch("routers.forms.delete_donation_service")
def test_delete_donation_not_found(mock_delete):
    """Test deletion of non-existent donation"""
    mock_delete.return_value = False

    response = client.delete("/forms/donation/12345678-1234-1234-1234-123456789abc/DONOR1")

    assert response.status_code == 404
    assert "Donation not found" in response.json()["detail"]


@patch("routers.forms.delete_request_service")
def test_delete_request_success(mock_delete):
    """Test successful request deletion"""
    mock_delete.return_value = True

    response = client.delete("/forms/request/12345678-1234-1234-1234-123456789abc/SHELTER1")

    assert response.status_code == 200
    assert response.json()["message"] == "Request deleted successfully"


@patch("routers.forms.delete_request_service")
def test_delete_request_not_found(mock_delete):
    """Test deletion of non-existent request"""
    mock_delete.return_value = False

    response = client.delete("/forms/request/12345678-1234-1234-1234-123456789abc/SHELTER1")

    assert response.status_code == 404
    assert "Request not found" in response.json()["detail"]


# ========== UPDATE Endpoints ==========

@patch("routers.forms.update_donation_service")
@patch("routers.forms.find_best_match_for_donation")
def test_update_donation_no_match(mock_match, mock_update):
    """Test updating donation when no match is found"""
    mock_update.return_value = {"donation_id": "D1", "item_name": "Updated Item", "quantity": 15}
    mock_match.return_value = None

    payload = {
        "donor_id": "DONOR1",
        "item_name": "Updated Item",
        "quantity": 15,
        "category": "Food"
    }

    response = client.put("/forms/donation/12345678-1234-1234-1234-123456789abc", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["donation"] is not None
    assert data["best_match"] is None


@patch("routers.forms.update_request_service")
@patch("routers.forms.find_best_match_for_request")
def test_update_request_no_match(mock_match, mock_update):
    """Test updating request when no match is found"""
    mock_update.return_value = {"request_id": "R1", "item_name": "Updated Request", "quantity": 25}
    mock_match.return_value = None

    payload = {
        "shelter_id": "SHELTER1",
        "item_name": "Updated Request",
        "quantity": 25,
        "category": "Clothing"
    }

    response = client.put("/forms/request/12345678-1234-1234-1234-123456789abc", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["request"] is not None
    assert data["best_match"] is None


@patch("routers.forms.update_donor")
def test_update_donor_success(mock_update):
    """Test successful donor profile update"""
    mock_update.return_value = {"success": True, "updated_fields": ["name", "phone_number"]}

    payload = {
        "name": "John Updated",
        "username": None,
        "phone_number": "555-1234"
    }

    response = client.put("/forms/donor/D001", json=payload)

    assert response.status_code == 200


@patch("routers.forms.update_shelter")
def test_update_shelter_success(mock_update):
    """Test successful shelter profile update"""
    mock_update.return_value = {"success": True}

    payload = {
        "shelter_name": "New Shelter Name",
        "phone_number": "555-9999",
        "address": "123 Main St",
        "city": "Seattle",
        "state": "WA",
        "zip_code": "98101"
    }

    response = client.put("/forms/shelter/S001", json=payload)

    assert response.status_code == 200


@patch("routers.forms.delete_donor")
def test_delete_donor_success(mock_delete):
    """Test successful donor deletion"""
    mock_delete.return_value = True

    response = client.delete("/forms/donor/D001")

    assert response.status_code == 200


@patch("routers.forms.delete_shelter")
def test_delete_shelter_success(mock_delete):
    """Test successful shelter deletion"""
    mock_delete.return_value = True

    response = client.delete("/forms/shelter/S001")

    assert response.status_code == 200


# ========== Validation Tests ==========

def test_create_donation_missing_fields():
    """Test donation creation with missing required fields"""
    payload = {
        "donor_id": "DONOR1"
        # missing item_name, quantity, category
    }

    response = client.post("/forms/donation", json=payload)

    assert response.status_code == 422  # Validation error


def test_create_request_missing_fields():
    """Test request creation with missing required fields"""
    payload = {
        "shelter_id": "SHELTER1",
        "item_name": "Blankets"
        # missing quantity, category
    }

    response = client.post("/forms/request", json=payload)

    assert response.status_code == 422  # Validation error


def test_create_donation_invalid_quantity():
    """Test donation creation with invalid quantity type"""
    payload = {
        "donor_id": "DONOR1",
        "item_name": "Rice",
        "quantity": "not-a-number",
        "category": "Food"
    }

    response = client.post("/forms/donation", json=payload)

    assert response.status_code == 422  # Validation error

