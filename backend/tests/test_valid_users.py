import pytest
from pydantic import ValidationError
from schemas.shelter import Shelter
from schemas.donor import Donor

# Correct shelter schema
def test_valid_shelter_model():
    data = {
        "userID": "S001",
        "username": "shelter_user",
        "shelter_name": "Hope Shelter",
        "email": "shelter@example.com",
        "phone_number": "789-1234",
        "city": "Seattle"
    }
    shelter = Shelter(**data)
    assert shelter.userID == "S001"
    assert shelter.city == "Seattle"
    assert shelter.email == "shelter@example.com"

def test_missing_required_fields():
    data = {
        "userID": "S002",
        "username": "shelter_user"
        # missing shelter_name, email, phone_number
    }
    with pytest.raises(ValidationError):
        Shelter(**data)

def test_optional_fields_can_be_none():
    data = {
        "userID": "S003",
        "username": "shelter_user",
        "shelter_name": "Safe Haven",
        "email": "safe@example.com",
        "phone_number": "345-6789",
        "address": None,
        "city": None,
        "state": None,
        "zip_code": None,
        "latitude": None,
        "longitude": None
    }
    shelter = Shelter(**data)
    assert shelter.address is None
    assert shelter.latitude is None

# ------------------------------
# correct donor schema
# ------------------------------
def test_valid_donor_model():
    data = {
        "userID": "D001",
        "name": "Alice",
        "username": "alicej",
        "email": "alice@example.com",
        "phone_number": "111-1111"
    }

    donor = Donor(**data)

    assert donor.userID == "D001"
    assert donor.name == "Alice"
    assert donor.username == "alicej"
    assert donor.email == "alice@example.com"
    assert donor.phone_number == "111-1111"


# missing email
def test_missing_required_fields():
    data = {
        "userID": "D002",
        "name": "Bob"
    }

    with pytest.raises(ValidationError):
        Donor(**data)


# fail if email is invalid
def test_invalid_email():
    data = {
        "userID": "D003",
        "name": "Emmy",
        "username": "Emmy123",
        "email": "not-an-email",
        "phone_number": "555-2222"
    }

    with pytest.raises(ValidationError):
        Donor(**data)


# Empty strings allowed for non-email fields
def test_empty_strings_allowed():
    data = {
        "userID": "",
        "name": "",
        "username": "",
        "email": "empty@example.com",
        "phone_number": ""
    }

    donor = Donor(**data)
    assert donor.userID == ""
    assert donor.name == ""
    assert donor.username == ""
    assert donor.phone_number == ""