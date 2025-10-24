from fastapi import APIRouter
from schemas.donor import DonorRegister
from schemas.shelter import ShelterRegister
from services.signup import create_donor, create_shelter

# Create a router for registration-related endpoints
router = APIRouter(
    prefix="/register",
    tags=["Register"]
)

# Donor Registration
@router.post("/donor")
def register_donor(donor: DonorRegister):
    """
    Endpoint for donor registration.
    Accepts JSON with userID, username, email, and phone_number. for now.
    """
    return create_donor(donor)


# Shelter Registration
@router.post("/shelter")
def register_shelter(shelter: ShelterRegister):
    """
    Endpoint for shelter registration.
    Accepts JSON with userID, username, shelter_name, email, and phone_number. for now
    """
    return create_shelter(shelter)