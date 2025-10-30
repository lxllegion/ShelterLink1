from schemas.match import Match
import json
from typing import List

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