# TODO: Implement donation and request submissions
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from schemas.forms import DonationForm, RequestForm
from services.forms import save_donation, save_request, get_donations, get_requests, delete_donation as delete_donation_service, delete_request as delete_request_service
from typing import List
from uuid import UUID
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

@router.delete("/donation/{donation_id}")
async def delete_donation(donation_id: UUID):
    result = delete_donation_service(donation_id)
    if result:
        return JSONResponse(status_code=200, content={"message": "Donation deleted successfully"})
    else:
        raise HTTPException(status_code=404, detail="Donation not found")

@router.delete("/request/{request_id}")
async def delete_request(request_id: UUID):
    result = delete_request_service(request_id)
    if result:
        return JSONResponse(status_code=200, content={"message": "Request deleted successfully"})
    else:
        raise HTTPException(status_code=404, detail="Request not found")