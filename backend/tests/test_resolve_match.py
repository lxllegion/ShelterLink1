import pytest
from services.match import resolve_match_status

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