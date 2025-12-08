from fastapi import APIRouter, HTTPException
from schemas.donor import Donor
from schemas.shelter import Shelter
from services.signup import create_donor, create_shelter

from pathlib import Path
import json

# Create a router for registration-related endpoints
router = APIRouter(
    prefix="/register",
    tags=["Register"]
)

# Donor Registration
@router.post("/donor")
def register_donor(donor: Donor):
    """
    Endpoint for donor registration.
    Accepts JSON with userID, username, email, and phone_number. for now.
    """
    result = create_donor(donor)

    # Check if registration failed
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result


# Shelter Registration
@router.post("/shelter")
def register_shelter(shelter: Shelter):
    """
    Endpoint for shelter registration.
    Accepts JSON with userID, username, shelter_name, email, and phone_number. for now
    """
    result = create_shelter(shelter)

    # Check if registration failed
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result