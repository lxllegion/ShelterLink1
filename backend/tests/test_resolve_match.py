import pytest
from unittest.mock import MagicMock
from services.match import resolve_match_db, resolve_match_status

# Mock session fixture
@pytest.fixture
def mock_session():
    mock = MagicMock()

    # Mock a row returned by session.execute(...).first()
    mock_row = MagicMock()
    mock_row._asdict.return_value = {
        "id": "1",
        "donor_id": "D00001",
        "shelter_id": "S00001",
        "status": "pending"
    }

    # session.execute(...).first() returns mock_row
    mock.execute.return_value.first.return_value = mock_row

    return mock

# patch SessionLocal for all tests
@pytest.fixture(autouse=True)
def patch_session_local(monkeypatch, mock_session):
    class FakeSessionMaker:
        def __call__(self, *args, **kwargs):
            return mock_session

        def __enter__(self):
            return mock_session

        def __exit__(self, exc_type, exc_val, exc_tb):
            return False

    monkeypatch.setattr("services.match.SessionLocal", FakeSessionMaker())

# basic logic tests
def test_pending_to_donor():
    assert resolve_match_status("pending", True) == "donor"

def test_pending_to_shelter():
    assert resolve_match_status("pending", False) == "shelter"

def test_donor_to_both():
    assert resolve_match_status("donor", False) == "both"

def test_shelter_to_both():
    assert resolve_match_status("shelter", True) == "both"

def test_both_stays_both():
    assert resolve_match_status("both", True) == "both"
    assert resolve_match_status("both", False) == "both"

def test_same_confirmation_does_not_change():
    assert resolve_match_status("donor", True) == "donor"
    assert resolve_match_status("shelter", False) == "shelter"


# Database function tests (mock)
def test_resolve_match_db_donor():
    result = resolve_match_db("1", "D00001")
    assert result == "donor"

def test_resolve_match_db_shelter():
    result = resolve_match_db("1", "S00001")
    assert result == "shelter"