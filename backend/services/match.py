from schemas.match import Match
import json
from typing import List, Dict, Any
from schemas.forms import DonationForm
from schemas.forms import RequestForm
from database import engine
from sqlalchemy import text

def get_matches_service():
    """
    Get all matches from mock data
    """
    try:
        with open("data/mock_matches.json", "r") as f:
            matches = json.load(f)
            return {"matches": matches}
    except Exception as e:
        return {"error": str(e)}
    except (FileNotFoundError, json.JSONDecodeError):
        return {"matches: []"}
    
def load_json(file_path: str) -> List[Dict[Any, Any]]:
    with open(file_path, 'r') as f:
        return json.load(f)
    
def categories_match(donor_item: dict, request_item: dict) -> bool:
    """
    Check if categories match 
    """
    return donor_item.get("category", "").lower() == request_item.get("category", "").lower()

def quantity_match(donor_qty: int, request_qty: int) -> bool:
    """
    Match if donor has zt least some of the requested item
    """
    return donor_qty >= 1 and request_qty >= 1

def find_matches(donation_id: int):
    """
    For now only shows 1 - basic matching
    Will eventually show all requests donation can fulfill
    Will eventually eturn earliest made request that it can fulfill
    """
    # Load mock data
    donations = load_json("data/mock_donations.json")
    requests = load_json("data/mock_requests.json")

    # Find the donation
    donation = next((d for d in donations if d["id"] == donation_id), None)
    if not donation:
        return []

    matches = []

    # Loop through each shelter request
    for req in requests:
        req_item = req["item"]
        donor_item = donation["item"]

        # 1. Categories match
        if not categories_match(donor_item, req_item):
            continue

        # 2. Donor must have at least 1 requested item
        if not quantity_match(donation["quantity"], req_item["quantity"]):
            continue

        # Match found
        match = {
            "donation_id": donation["id"],
            "request_id": req["id"],
            "donor_has": donation["quantity"],
            "shelter_needs": req_item["quantity"],
            "can_fulfill": "partial" if donation["quantity"] < req_item["quantity"] else "full"
        }
        matches.append(match)

    return matches

def save_matches(new_matches: list):
    """
    Save new matches
    """
    try:
        # Existing
        try:
            with open("data/mock_matches.json", "r") as f:
                existing = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            existing = []

        # Add new
        existing.extend(new_matches)

        # Save
        with open("data/mock_matches.json", "w") as f:
            json.dump(existing, f, indent=2)
    except Exception as e:
        print(f"Error saving matches: {e}")