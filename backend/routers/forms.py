from fastapi import APIRouter, Depends, Query
from schemas.forms import DonationForm, RequestForm, DonationRead, RequestRead
from services.forms import save_donation, save_request, get_donations, get_requests
from typing import List, Optional

router = APIRouter(prefix="/forms", tags=["forms"])

@router.post("/donation", response_model=DonationRead)
async def create_donation(donation: DonationForm):
    """
    Create a new donation.
    Returns the full donation including the ID.
    """
    return save_donation(donation)


@router.post("/request", response_model=RequestRead)
async def create_request(request: RequestForm):
    """
    Create a new request.
    Returns the full request including the ID.
    """
    return save_request(request)

# Endpoint to get all donations
@router.get("/donations", response_model=List[DonationRead])
async def list_donations(user_id: Optional[str] = Query(None)):
    """
    Get all donations with IDs included.
    """
    return get_donations(user_id=user_id)

# Endpoint to get all requests
@router.get("/requests", response_model=List[RequestRead])
async def list_requests(user_id: Optional[str] = Query(None)):
    """
    Get all requests with IDs included.
    """
    return get_requests(user_id=user_id)