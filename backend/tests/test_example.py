from fastapi.testclient import TestClient
from main import app
import json
import os
import pytest
from services import match

client = TestClient(app)

def test_example():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Backend is now running"}

# basic matching algorithm tests
@pytest.fixture
def patched_load_json(tmp_path):
    """
    temporary test data - match.load_json
    helper for writing JSON files returned
    """
    data_dir = tmp_path
    data_dir.mkdir(exist_ok=True)

    def write_json(file_name, data):
        with open(data_dir / file_name, "w") as f:
            json.dump(data, f, indent=2)

    original_load_json = match.load_json
    match.load_json = lambda path: json.load(open(path.replace("data", str(data_dir))))

    yield write_json

    # Restore original function
    match.load_json = original_load_json


# category tests
def test_categories_match_case_insensitive():
    donor_item = {"category": "Food"}
    request_item = {"category": "food"}
    assert match.categories_match(donor_item, request_item)

def test_categories_match_exact():
    donor_item = {"category": "Clothing"}
    request_item = {"category": "Clothing"}
    assert match.categories_match(donor_item, request_item)

def test_categories_match_mixed_case():
    donor_item = {"category": "medical sUpPlies"}
    request_item = {"category": "mediCal suppLIEs"}
    assert match.categories_match(donor_item, request_item)

def test_categories_no_match():
    donor_item = {"category": "Clothing"}
    request_item = {"category": "Food"}
    assert not match.categories_match(donor_item, request_item)

# Quantity tests
def test_quantity_match_positive():
    assert match.quantity_match(5, 2)

def test_quantity_match_zero_donor():
    assert not match.quantity_match(0, 3)

def test_quantity_match_zero_request():
    assert not match.quantity_match(5, 0)

# Matching tests
def test_find_matches_full_match(patched_load_json):
    write_json = patched_load_json

    donations = [{"id": 1, "item": {"category": "Food"}, "quantity": 10}]
    requests = [{"id": 101, "item": {"category": "Food", "quantity": 5}}]

    write_json("mock_donations.json", donations)
    write_json("mock_requests.json", requests)

    results = match.find_matches(1)
    assert len(results) == 1
    res = results[0]
    assert res["donation_id"] == 1
    assert res["request_id"] == 101
    assert res["can_fulfill"] == "full"
    assert res["donor_has"] == 10
    assert res["shelter_needs"] == 5

def test_find_matches_partial_match(patched_load_json):
    write_json = patched_load_json

    donations = [{"id": 2, "item": {"category": "Food"}, "quantity": 3}]
    requests = [{"id": 102, "item": {"category": "Food", "quantity": 5}}]

    write_json("mock_donations.json", donations)
    write_json("mock_requests.json", requests)

    results = match.find_matches(2)
    assert len(results) == 1
    assert results[0]["can_fulfill"] == "partial"
    assert results[0]["donor_has"] == 3
    assert results[0]["shelter_needs"] == 5

def test_find_matches_no_category_match(patched_load_json):
    write_json = patched_load_json

    donations = [{"id": 3, "item": {"category": "Clothing"}, "quantity": 10}]
    requests = [{"id": 103, "item": {"category": "Food", "quantity": 5}}]

    write_json("mock_donations.json", donations)
    write_json("mock_requests.json", requests)

    results = match.find_matches(3)
    assert results == []

def test_find_matches_no_donation_found(patched_load_json):
    write_json = patched_load_json
    write_json("mock_donations.json", [])
    write_json("mock_requests.json", [])

    results = match.find_matches(999)
    assert results == []

def test_find_matches_multiple_requests(patched_load_json):
    write_json = patched_load_json

    donations = [{"id": 4, "item": {"category": "Food"}, "quantity": 10}]
    requests = [
        {"id": 104, "item": {"category": "Food", "quantity": 3}},
        {"id": 105, "item": {"category": "Food", "quantity": 5}}
    ]

    write_json("mock_donations.json", donations)
    write_json("mock_requests.json", requests)

    results = match.find_matches(4)
    assert len(results) == 2
    ids = {r["request_id"] for r in results}
    assert {104, 105} == ids

# error test - missing file
def test_get_matches_service_missing_file(tmp_path):
    os.chdir(tmp_path)  
    result = match.get_matches_service()
    assert "matches" in result or "error" in result