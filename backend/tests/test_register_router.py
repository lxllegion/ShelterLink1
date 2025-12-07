from fastapi.testclient import TestClient
from unittest.mock import patch
from main import app

client = TestClient(app)


# ========== Donor Registration Tests ==========

@patch("routers.register.create_donor")
def test_register_donor_success(mock_create):
    """Test successful donor registration"""
    mock_create.return_value = {"message": "Donor registered successfully", "userID": "D001"}

    payload = {
        "userID": "D001",
        "name": "John Doe",
        "username": "johndoe",
        "email": "john@example.com",
        "phone_number": "123-456-7890"
    }

    response = client.post("/register/donor", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Donor registered successfully"
    mock_create.assert_called_once()


@patch("routers.register.create_donor")
def test_register_donor_duplicate(mock_create):
    """Test donor registration with duplicate userID"""
    mock_create.return_value = {"error": "Donor already exists"}

    payload = {
        "userID": "D001",
        "name": "John Doe",
        "username": "johndoe",
        "email": "john@example.com",
        "phone_number": "123-456-7890"
    }

    response = client.post("/register/donor", json=payload)

    assert response.status_code == 400
    assert "Donor already exists" in response.json()["detail"]


@patch("routers.register.create_donor")
def test_register_donor_database_error(mock_create):
    """Test donor registration with database error"""
    mock_create.return_value = {"error": "Database connection failed"}

    payload = {
        "userID": "D001",
        "name": "John Doe",
        "username": "johndoe",
        "email": "john@example.com",
        "phone_number": "123-456-7890"
    }

    response = client.post("/register/donor", json=payload)

    assert response.status_code == 400
    assert "Database connection failed" in response.json()["detail"]


def test_register_donor_missing_required_fields():
    """Test donor registration with missing required fields"""
    payload = {
        "userID": "D001",
        "name": "John Doe"
        # missing username, email, phone_number
    }

    response = client.post("/register/donor", json=payload)

    assert response.status_code == 422  # Validation error


def test_register_donor_invalid_email():
    """Test donor registration with invalid email format"""
    payload = {
        "userID": "D001",
        "name": "John Doe",
        "username": "johndoe",
        "email": "not-an-email",
        "phone_number": "123-456-7890"
    }

    response = client.post("/register/donor", json=payload)

    assert response.status_code == 422  # Validation error


# ========== Shelter Registration Tests ==========

@patch("routers.register.create_shelter")
def test_register_shelter_success(mock_create):
    """Test successful shelter registration"""
    mock_create.return_value = {"message": "Shelter registered successfully", "userID": "S001"}

    payload = {
        "userID": "S001",
        "username": "hopeshelter",
        "shelter_name": "Hope Shelter",
        "email": "hope@example.com",
        "phone_number": "098-765-4321"
    }

    response = client.post("/register/shelter", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Shelter registered successfully"
    mock_create.assert_called_once()


@patch("routers.register.create_shelter")
def test_register_shelter_with_location(mock_create):
    """Test shelter registration with optional location fields"""
    mock_create.return_value = {"message": "Shelter registered successfully", "userID": "S001"}

    payload = {
        "userID": "S001",
        "username": "hopeshelter",
        "shelter_name": "Hope Shelter",
        "email": "hope@example.com",
        "phone_number": "098-765-4321",
        "address": "123 Main St",
        "city": "Seattle",
        "state": "WA",
        "zip_code": "98101",
        "latitude": "47.6062",
        "longitude": "-122.3321"
    }

    response = client.post("/register/shelter", json=payload)

    assert response.status_code == 200


@patch("routers.register.create_shelter")
def test_register_shelter_duplicate(mock_create):
    """Test shelter registration with duplicate userID"""
    mock_create.return_value = {"error": "Shelter already exists"}

    payload = {
        "userID": "S001",
        "username": "hopeshelter",
        "shelter_name": "Hope Shelter",
        "email": "hope@example.com",
        "phone_number": "098-765-4321"
    }

    response = client.post("/register/shelter", json=payload)

    assert response.status_code == 400
    assert "Shelter already exists" in response.json()["detail"]


def test_register_shelter_missing_required_fields():
    """Test shelter registration with missing required fields"""
    payload = {
        "userID": "S001",
        "username": "hopeshelter"
        # missing shelter_name, email, phone_number
    }

    response = client.post("/register/shelter", json=payload)

    assert response.status_code == 422  # Validation error


def test_register_shelter_invalid_email():
    """Test shelter registration with invalid email format"""
    payload = {
        "userID": "S001",
        "username": "hopeshelter",
        "shelter_name": "Hope Shelter",
        "email": "invalid-email",
        "phone_number": "098-765-4321"
    }

    response = client.post("/register/shelter", json=payload)

    assert response.status_code == 422  # Validation error

