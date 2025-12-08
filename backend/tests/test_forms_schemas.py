import pytest
from pydantic import ValidationError
from schemas.forms import DonationForm, RequestForm, DonorUpdate, ShelterUpdate


# ========== DonationForm Tests ==========

def test_valid_donation_form():
    """Test valid donation form creation"""
    data = {
        "donor_id": "D001",
        "item_name": "Canned Beans",
        "quantity": 50,
        "category": "Food"
    }
    donation = DonationForm(**data)
    
    assert donation.donor_id == "D001"
    assert donation.item_name == "Canned Beans"
    assert donation.quantity == 50
    assert donation.category == "Food"


def test_donation_form_missing_donor_id():
    """Test donation form with missing donor_id"""
    data = {
        "item_name": "Blankets",
        "quantity": 10,
        "category": "Bedding"
    }
    
    with pytest.raises(ValidationError):
        DonationForm(**data)


def test_donation_form_missing_item_name():
    """Test donation form with missing item_name"""
    data = {
        "donor_id": "D001",
        "quantity": 10,
        "category": "Food"
    }
    
    with pytest.raises(ValidationError):
        DonationForm(**data)


def test_donation_form_missing_quantity():
    """Test donation form with missing quantity"""
    data = {
        "donor_id": "D001",
        "item_name": "Rice",
        "category": "Food"
    }
    
    with pytest.raises(ValidationError):
        DonationForm(**data)


def test_donation_form_invalid_quantity_type():
    """Test donation form with non-integer quantity"""
    data = {
        "donor_id": "D001",
        "item_name": "Rice",
        "quantity": "ten",
        "category": "Food"
    }
    
    with pytest.raises(ValidationError):
        DonationForm(**data)


def test_donation_form_quantity_coercion():
    """Test that string numbers are coerced to int"""
    data = {
        "donor_id": "D001",
        "item_name": "Rice",
        "quantity": "10",  # String that can be converted
        "category": "Food"
    }
    
    donation = DonationForm(**data)
    assert donation.quantity == 10
    assert isinstance(donation.quantity, int)


# ========== RequestForm Tests ==========

def test_valid_request_form():
    """Test valid request form creation"""
    data = {
        "shelter_id": "S001",
        "item_name": "Winter Jackets",
        "quantity": 25,
        "category": "Clothing"
    }
    request = RequestForm(**data)
    
    assert request.shelter_id == "S001"
    assert request.item_name == "Winter Jackets"
    assert request.quantity == 25
    assert request.category == "Clothing"


def test_request_form_missing_shelter_id():
    """Test request form with missing shelter_id"""
    data = {
        "item_name": "Blankets",
        "quantity": 10,
        "category": "Bedding"
    }
    
    with pytest.raises(ValidationError):
        RequestForm(**data)


def test_request_form_missing_category():
    """Test request form with missing category"""
    data = {
        "shelter_id": "S001",
        "item_name": "Blankets",
        "quantity": 10
    }
    
    with pytest.raises(ValidationError):
        RequestForm(**data)


# ========== DonorUpdate Tests ==========

def test_donor_update_all_fields():
    """Test donor update with all optional fields"""
    data = {
        "name": "John Updated",
        "username": "johnupdated",
        "phone_number": "555-1234"
    }
    update = DonorUpdate(**data)
    
    assert update.name == "John Updated"
    assert update.username == "johnupdated"
    assert update.phone_number == "555-1234"


def test_donor_update_partial():
    """Test donor update with only some fields"""
    data = {
        "name": "John Updated"
    }
    update = DonorUpdate(**data)
    
    assert update.name == "John Updated"
    assert update.username is None
    assert update.phone_number is None


def test_donor_update_empty():
    """Test donor update with no fields (all None)"""
    data = {}
    update = DonorUpdate(**data)
    
    assert update.name is None
    assert update.username is None
    assert update.phone_number is None


def test_donor_update_explicit_none():
    """Test donor update with explicit None values"""
    data = {
        "name": None,
        "username": "newusername",
        "phone_number": None
    }
    update = DonorUpdate(**data)
    
    assert update.name is None
    assert update.username == "newusername"
    assert update.phone_number is None


# ========== ShelterUpdate Tests ==========

def test_shelter_update_all_fields():
    """Test shelter update with all optional fields"""
    data = {
        "shelter_name": "New Hope Shelter",
        "phone_number": "555-9999",
        "address": "456 Oak Ave",
        "city": "Portland",
        "state": "OR",
        "zip_code": "97201",
        "latitude": "45.5152",
        "longitude": "-122.6784"
    }
    update = ShelterUpdate(**data)
    
    assert update.shelter_name == "New Hope Shelter"
    assert update.city == "Portland"
    assert update.latitude == "45.5152"


def test_shelter_update_partial():
    """Test shelter update with only some fields"""
    data = {
        "shelter_name": "Updated Name",
        "city": "Seattle"
    }
    update = ShelterUpdate(**data)
    
    assert update.shelter_name == "Updated Name"
    assert update.city == "Seattle"
    assert update.address is None
    assert update.state is None


def test_shelter_update_location_only():
    """Test shelter update with only location fields"""
    data = {
        "address": "789 Pine St",
        "city": "Tacoma",
        "state": "WA",
        "zip_code": "98401"
    }
    update = ShelterUpdate(**data)
    
    assert update.shelter_name is None
    assert update.address == "789 Pine St"
    assert update.city == "Tacoma"


def test_shelter_update_empty():
    """Test shelter update with no fields"""
    data = {}
    update = ShelterUpdate(**data)
    
    assert update.shelter_name is None
    assert update.phone_number is None
    assert update.address is None
    assert update.city is None
    assert update.state is None
    assert update.zip_code is None
    assert update.latitude is None
    assert update.longitude is None

