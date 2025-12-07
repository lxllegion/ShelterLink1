from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from main import app
import pytest

client = TestClient(app)


# ========== Router Tests: /vector-match/donation/{donation_id}/matches ==========

@patch("routers.vector_match.find_similar_requests")
@patch("routers.vector_match.save_vector_matches")
def test_get_matches_for_donation_success(mock_save, mock_find):
    """Test successful retrieval of matches for a donation"""
    mock_find.return_value = [
        {
            "request_id": "R001",
            "donor_id": "D001",
            "shelter_id": "S001",
            "shelter_name": "Hope Shelter",
            "item_name": "Canned Food",
            "quantity": 10,
            "category": "Food",
            "similarity_score": 0.95,
            "can_fulfill": "full"
        }
    ]
    mock_save.return_value = {"saved": 1, "matches": mock_find.return_value}

    response = client.get("/vector-match/donation/D001/matches")

    assert response.status_code == 200
    data = response.json()
    assert data["donation_id"] == "D001"
    assert data["matches_found"] == 1
    assert len(data["matches"]) == 1
    assert data["matches"][0]["similarity_score"] == 0.95


@patch("routers.vector_match.find_similar_requests")
def test_get_matches_for_donation_no_matches(mock_find):
    """Test when no matches are found for a donation"""
    mock_find.return_value = []

    response = client.get("/vector-match/donation/D001/matches")

    assert response.status_code == 200
    data = response.json()
    assert data["matches_found"] == 0
    assert data["matches"] == []


@patch("routers.vector_match.find_similar_requests")
@patch("routers.vector_match.save_vector_matches")
def test_get_matches_for_donation_with_params(mock_save, mock_find):
    """Test donation matches with custom limit and threshold"""
    mock_find.return_value = []
    mock_save.return_value = {"saved": 0}

    response = client.get("/vector-match/donation/D001/matches?limit=5&threshold=0.9&save=false")

    assert response.status_code == 200
    mock_find.assert_called_once_with("D001", limit=5, threshold=0.9)


def test_get_matches_for_donation_invalid_limit():
    """Test validation error for invalid limit parameter"""
    response = client.get("/vector-match/donation/D001/matches?limit=0")
    assert response.status_code == 422  # Validation error

    response = client.get("/vector-match/donation/D001/matches?limit=101")
    assert response.status_code == 422


def test_get_matches_for_donation_invalid_threshold():
    """Test validation error for invalid threshold parameter"""
    response = client.get("/vector-match/donation/D001/matches?threshold=-0.1")
    assert response.status_code == 422

    response = client.get("/vector-match/donation/D001/matches?threshold=1.5")
    assert response.status_code == 422


# ========== Router Tests: /vector-match/request/{request_id}/matches ==========

@patch("routers.vector_match.find_similar_donations")
@patch("routers.vector_match.save_vector_matches")
def test_get_matches_for_request_success(mock_save, mock_find):
    """Test successful retrieval of matches for a request"""
    mock_find.return_value = [
        {
            "donation_id": "D001",
            "donor_id": "DONOR1",
            "donor_name": "John Doe",
            "shelter_id": "S001",
            "item_name": "Blankets",
            "quantity": 15,
            "category": "Bedding",
            "similarity_score": 0.88,
            "can_fulfill": "full"
        }
    ]
    mock_save.return_value = {"saved": 1, "matches": mock_find.return_value}

    response = client.get("/vector-match/request/R001/matches")

    assert response.status_code == 200
    data = response.json()
    assert data["request_id"] == "R001"
    assert data["matches_found"] == 1


@patch("routers.vector_match.find_similar_donations")
def test_get_matches_for_request_no_matches(mock_find):
    """Test when no matches are found for a request"""
    mock_find.return_value = []

    response = client.get("/vector-match/request/R001/matches")

    assert response.status_code == 200
    data = response.json()
    assert data["matches_found"] == 0


# ========== Router Tests: /vector-match/donation/{donation_id}/best-match ==========

@patch("routers.vector_match.find_best_match_for_donation")
@patch("routers.vector_match.save_vector_matches")
def test_get_best_match_for_donation_found(mock_save, mock_find):
    """Test finding the best match for a donation"""
    mock_find.return_value = {
        "request_id": "R001",
        "shelter_name": "Hope Shelter",
        "similarity_score": 0.95
    }
    mock_save.return_value = {
        "saved": 1,
        "matches": [{
            "id": "M001",
            "request_id": "R001",
            "shelter_name": "Hope Shelter",
            "similarity_score": 0.95
        }]
    }

    response = client.get("/vector-match/donation/D001/best-match")

    assert response.status_code == 200
    data = response.json()
    assert data["donation_id"] == "D001"
    assert data["best_match"] is not None
    assert data["best_match"]["id"] == "M001"


@patch("routers.vector_match.find_best_match_for_donation")
def test_get_best_match_for_donation_not_found(mock_find):
    """Test when no best match is found for a donation"""
    mock_find.return_value = None

    response = client.get("/vector-match/donation/D001/best-match")

    assert response.status_code == 200
    data = response.json()
    assert data["best_match"] is None
    assert data["saved"] == 0


# ========== Router Tests: /vector-match/request/{request_id}/best-match ==========

@patch("routers.vector_match.find_best_match_for_request")
@patch("routers.vector_match.save_vector_matches")
def test_get_best_match_for_request_found(mock_save, mock_find):
    """Test finding the best match for a request"""
    mock_find.return_value = {
        "donation_id": "D001",
        "donor_name": "John Doe",
        "similarity_score": 0.92
    }
    mock_save.return_value = {
        "saved": 1,
        "matches": [{
            "id": "M001",
            "donation_id": "D001",
            "donor_name": "John Doe",
            "similarity_score": 0.92
        }]
    }

    response = client.get("/vector-match/request/R001/best-match")

    assert response.status_code == 200
    data = response.json()
    assert data["request_id"] == "R001"
    assert data["best_match"] is not None


@patch("routers.vector_match.find_best_match_for_request")
def test_get_best_match_for_request_not_found(mock_find):
    """Test when no best match is found for a request"""
    mock_find.return_value = None

    response = client.get("/vector-match/request/R001/best-match")

    assert response.status_code == 200
    data = response.json()
    assert data["best_match"] is None


# ========== Router Tests: /vector-match/all-matches ==========

@patch("routers.vector_match.find_all_matches")
@patch("routers.vector_match.save_vector_matches")
def test_get_all_matches_success(mock_save, mock_find):
    """Test retrieving all matches in the system"""
    mock_find.return_value = [
        {
            "donation_id": "D001",
            "request_id": "R001",
            "similarity_score": 0.95
        },
        {
            "donation_id": "D002",
            "request_id": "R002",
            "similarity_score": 0.85
        }
    ]
    mock_save.return_value = {"saved": 2}

    response = client.get("/vector-match/all-matches")

    assert response.status_code == 200
    data = response.json()
    assert data["total_matches"] == 2


@patch("routers.vector_match.find_all_matches")
@patch("routers.vector_match.save_vector_matches")
def test_get_all_matches_with_params(mock_save, mock_find):
    """Test all matches with custom threshold and quantity filter"""
    mock_find.return_value = []
    mock_save.return_value = {"saved": 0}

    response = client.get("/vector-match/all-matches?threshold=0.9&min_quantity_match=true")

    assert response.status_code == 200
    mock_find.assert_called_once_with(threshold=0.9, min_quantity_match=True)


@patch("routers.vector_match.find_all_matches")
@patch("routers.vector_match.save_vector_matches")
def test_get_all_matches_empty(mock_save, mock_find):
    """Test when no matches exist in the system"""
    mock_find.return_value = []
    mock_save.return_value = {"saved": 0}

    response = client.get("/vector-match/all-matches")

    assert response.status_code == 200
    data = response.json()
    assert data["total_matches"] == 0


# ========== Router Tests: /vector-match/donor/{donor_id}/matches ==========

@patch("routers.vector_match.get_matches_for_donor")
@patch("routers.vector_match.save_vector_matches")
def test_get_donor_matches_success(mock_save, mock_get):
    """Test retrieving all matches for a donor"""
    mock_get.return_value = [
        {
            "donation_id": "D001",
            "request_id": "R001",
            "similarity_score": 0.95
        }
    ]
    mock_save.return_value = {"saved": 1}

    response = client.get("/vector-match/donor/DONOR1/matches")

    assert response.status_code == 200
    data = response.json()
    assert data["donor_id"] == "DONOR1"
    assert data["total_matches"] == 1


@patch("routers.vector_match.get_matches_for_donor")
@patch("routers.vector_match.save_vector_matches")
def test_get_donor_matches_empty(mock_save, mock_get):
    """Test when donor has no matches"""
    mock_get.return_value = []
    mock_save.return_value = {"saved": 0}

    response = client.get("/vector-match/donor/DONOR1/matches")

    assert response.status_code == 200
    data = response.json()
    assert data["total_matches"] == 0


@patch("routers.vector_match.get_matches_for_donor")
@patch("routers.vector_match.save_vector_matches")
def test_get_donor_matches_with_params(mock_save, mock_get):
    """Test donor matches with custom parameters"""
    mock_get.return_value = []
    mock_save.return_value = {"saved": 0}

    response = client.get("/vector-match/donor/DONOR1/matches?limit=5&threshold=0.8")

    assert response.status_code == 200
    mock_get.assert_called_once_with("DONOR1", limit=5, threshold=0.8)


# ========== Router Tests: /vector-match/shelter/{shelter_id}/matches ==========

@patch("routers.vector_match.get_matches_for_shelter")
@patch("routers.vector_match.save_vector_matches")
def test_get_shelter_matches_success(mock_save, mock_get):
    """Test retrieving all matches for a shelter"""
    mock_get.return_value = [
        {
            "donation_id": "D001",
            "request_id": "R001",
            "similarity_score": 0.88
        },
        {
            "donation_id": "D002",
            "request_id": "R001",
            "similarity_score": 0.82
        }
    ]
    mock_save.return_value = {"saved": 2}

    response = client.get("/vector-match/shelter/SHELTER1/matches")

    assert response.status_code == 200
    data = response.json()
    assert data["shelter_id"] == "SHELTER1"
    assert data["total_matches"] == 2


@patch("routers.vector_match.get_matches_for_shelter")
@patch("routers.vector_match.save_vector_matches")
def test_get_shelter_matches_empty(mock_save, mock_get):
    """Test when shelter has no matches"""
    mock_get.return_value = []
    mock_save.return_value = {"saved": 0}

    response = client.get("/vector-match/shelter/SHELTER1/matches")

    assert response.status_code == 200
    data = response.json()
    assert data["total_matches"] == 0


# ========== Service Tests: find_best_match functions ==========

@patch("services.vector_match.find_similar_requests")
def test_find_best_match_for_donation_returns_first(mock_find):
    """Test that find_best_match_for_donation returns the first match"""
    from services.vector_match import find_best_match_for_donation
    
    mock_find.return_value = [
        {"request_id": "R001", "similarity_score": 0.95},
        {"request_id": "R002", "similarity_score": 0.85}
    ]
    
    result = find_best_match_for_donation("D001")
    
    assert result is not None
    assert result["request_id"] == "R001"
    mock_find.assert_called_once_with("D001", limit=1, threshold=0.80)


@patch("services.vector_match.find_similar_requests")
def test_find_best_match_for_donation_returns_none(mock_find):
    """Test that find_best_match_for_donation returns None when no matches"""
    from services.vector_match import find_best_match_for_donation
    
    mock_find.return_value = []
    
    result = find_best_match_for_donation("D001")
    
    assert result is None


@patch("services.vector_match.find_similar_donations")
def test_find_best_match_for_request_returns_first(mock_find):
    """Test that find_best_match_for_request returns the first match"""
    from services.vector_match import find_best_match_for_request
    
    mock_find.return_value = [
        {"donation_id": "D001", "similarity_score": 0.92}
    ]
    
    result = find_best_match_for_request("R001")
    
    assert result is not None
    assert result["donation_id"] == "D001"
    mock_find.assert_called_once_with("R001", limit=1, threshold=0.80)


@patch("services.vector_match.find_similar_donations")
def test_find_best_match_for_request_returns_none(mock_find):
    """Test that find_best_match_for_request returns None when no matches"""
    from services.vector_match import find_best_match_for_request
    
    mock_find.return_value = []
    
    result = find_best_match_for_request("R001")
    
    assert result is None


# ========== Service Tests: save_vector_matches ==========

@patch("services.vector_match.engine")
@patch("services.vector_match.send_match_emails")
def test_save_vector_matches_empty(mock_emails, mock_engine):
    """Test save_vector_matches with empty list"""
    from services.vector_match import save_vector_matches
    
    result = save_vector_matches([])
    
    assert result["saved"] == 0
    assert "No matches to save" in result["message"]


@patch("services.vector_match.engine")
@patch("services.vector_match.send_match_emails")
def test_save_vector_matches_formats_correctly(mock_emails, mock_engine):
    """Test that save_vector_matches formats match data correctly"""
    from services.vector_match import save_vector_matches
    
    # Mock the database connection
    mock_conn = MagicMock()
    mock_engine.begin.return_value.__enter__ = MagicMock(return_value=mock_conn)
    mock_engine.begin.return_value.__exit__ = MagicMock(return_value=False)
    mock_conn.execute.return_value.fetchone.return_value = None
    
    matches = [{
        "donor_id": "D001",
        "donor_name": "John Doe",
        "shelter_id": "S001",
        "shelter_name": "Hope Shelter",
        "item_name": "Canned Food",
        "quantity": 10,
        "category": "Food",
        "donation_id": "DON001",
        "request_id": "REQ001",
        "similarity_score": 0.95,
        "can_fulfill": "full"
    }]
    
    result = save_vector_matches(matches, save_to_file=False, save_to_db=False)
    
    assert result["saved"] == 1
    assert len(result["matches"]) == 1
    
    saved_match = result["matches"][0]
    assert "id" in saved_match
    assert saved_match["donor_id"] == "D001"
    assert saved_match["donor_username"] == "John Doe"
    assert saved_match["shelter_name"] == "Hope Shelter"
    assert saved_match["status"] == "pending"
    assert "matched_at" in saved_match


# ========== Service Tests: Helper functions ==========

def test_get_donor_email_with_none():
    """Test get_donor_email returns None for empty input"""
    from services.vector_match import get_donor_email
    
    mock_conn = MagicMock()
    result = get_donor_email(mock_conn, "")
    
    assert result is None
    mock_conn.execute.assert_not_called()


def test_get_shelter_email_with_none():
    """Test get_shelter_email returns None for empty input"""
    from services.vector_match import get_shelter_email
    
    mock_conn = MagicMock()
    result = get_shelter_email(mock_conn, "")
    
    assert result is None
    mock_conn.execute.assert_not_called()


def test_get_donor_phone_with_none():
    """Test get_donor_phone returns None for empty input"""
    from services.vector_match import get_donor_phone
    
    mock_conn = MagicMock()
    result = get_donor_phone(mock_conn, "")
    
    assert result is None
    mock_conn.execute.assert_not_called()


def test_get_shelter_phone_with_none():
    """Test get_shelter_phone returns None for empty input"""
    from services.vector_match import get_shelter_phone
    
    mock_conn = MagicMock()
    result = get_shelter_phone(mock_conn, "")
    
    assert result is None
    mock_conn.execute.assert_not_called()


def test_user_save_match_id_invalid_user_type():
    """Test user_save_match_id raises error for invalid user type"""
    from services.vector_match import user_save_match_id
    
    mock_conn = MagicMock()
    
    # Should not raise but log error internally
    user_save_match_id("M001", "U001", "invalid_type", mock_conn)
    
    # No database update should happen for invalid type
    mock_conn.execute.assert_not_called()

