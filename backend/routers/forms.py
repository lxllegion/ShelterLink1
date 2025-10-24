# TODO: Implement donation and request submissions
from fastapi import APIRouter, Depends
from schemas.forms import DonationForm, RequestForm
from services.forms import save_donation, save_request, get_donations, get_requests
from typing import List

router = APIRouter(prefix="/forms", tags=["forms"])

# Endpoint to create a donation
@router.post("/donation")
async def create_donation(donation: DonationForm):
    return save_donation(donation)

# Endpoint to create a request
@router.post("/request")
async def create_request(request: RequestForm):
    return save_request(request)

# Endpoint to get all donations
@router.get("/donations", response_model=List[DonationForm])
async def list_donations():
    return get_donations()

# Endpoint to get all requests
@router.get("/requests", response_model=List[RequestForm])
async def list_requests():
    return get_requests()