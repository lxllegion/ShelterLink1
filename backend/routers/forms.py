# TODO: Implement donation and request submissions
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from schemas.forms import DonationForm, RequestForm
from services.forms import save_donation, save_request, get_donations, get_requests, delete_donation as delete_donation_service, delete_request as delete_request_service, update_donation as update_donation_service, update_request as update_request_service, update_donor, update_shelter
from services.vector_match import find_best_match_for_donation, find_best_match_for_request, save_vector_matches
from typing import List, Optional
from fastapi import Query
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

# Endpoint to update a donation
@router.put("/donation/{donation_id}")
async def update_donation(donation_id: UUID, donation: DonationForm):
    # Update the donation
    updated_donation = update_donation_service(donation_id, donation)
    
    # Find new best match
    try:
        best_match = find_best_match_for_donation(str(donation_id))
        save_vector_matches([best_match])
        return {
            "donation": updated_donation,
            "best_match": best_match
        }
    except Exception as e:
        print(f"Error finding match after update: {e}")
        # Return without match if matching fails
        return {
            "donation": updated_donation,
            "best_match": None
        }

# Endpoint to update a request
@router.put("/request/{request_id}")
async def update_request(request_id: UUID, request: RequestForm):
    # Update the request
    updated_request = update_request_service(request_id, request)

    # Find new best match
    try:
        best_match = find_best_match_for_request(str(request_id))
        save_vector_matches([best_match])
        return {
            "request": updated_request,
            "best_match": best_match
        }
    except Exception as e:
        print(f"Error finding match after update: {e}")
        # Return without match if matching fails
        return {
            "request": updated_request,
            "best_match": None
        }

@router.get("/donations", response_model=List[dict])
async def list_donations(user_id: Optional[str] = Query(None)):
    return get_donations(user_id=user_id)

# Endpoint to get all requests
@router.get("/requests", response_model=List[dict])
async def list_requests(user_id: Optional[str] = Query(None)):
    return get_requests(user_id=user_id)

@router.delete("/donation/{donation_id}/{donor_id}")
async def delete_donation(donation_id: UUID, donor_id: str):
    result = delete_donation_service(donation_id, donor_id)
    if result:
        return JSONResponse(status_code=200, content={"message": "Donation deleted successfully"})
    else:
        raise HTTPException(status_code=404, detail="Donation not found")

@router.delete("/request/{request_id}/{shelter_id}")
async def delete_request(request_id: UUID, shelter_id: str):
    result = delete_request_service(request_id, shelter_id)
    if result:
        return JSONResponse(status_code=200, content={"message": "Request deleted successfully"})
    else:
        raise HTTPException(status_code=404, detail="Request not found")

@router.put("/donor/{uid}")
async def modify_donor(
    uid: str,
    name: Optional[str] = None,
    username: Optional[str] = None,
    phone_number: Optional[str] = None
):
    """
    Update donor information.
    Only the fields provided will be updated.
    Returns the full donor info (without donation_ids).
    """
    return update_donor(uid=uid, name=name, username=username, phone_number=phone_number)

@router.put("/shelter/{uid}")
async def modify_shelter(
    uid: str,
    shelter_name: Optional[str] = None,
    phone_number: Optional[str] = None,
    address: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    zip_code: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None
):
    """
    Update shelter information.
    Only the fields provided will be updated.
    Returns the full shelter info.
    """
    return update_shelter(
        uid=uid,
        shelter_name=shelter_name,
        phone_number=phone_number,
        address=address,
        city=city,
        state=state,
        zip_code=zip_code,
        latitude=latitude,
        longitude=longitude
    )