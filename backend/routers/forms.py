from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from schemas.forms import DonationForm, DonorUpdate, RequestForm, ShelterUpdate
from services.forms import save_donation, save_request, get_donations, get_requests, delete_donation as delete_donation_service, delete_request as delete_request_service, update_donation as update_donation_service, update_request as update_request_service, update_donor, update_shelter, delete_donor, delete_shelter
from services.vector_match import find_best_match_for_donation, find_best_match_for_request, save_vector_matches
from typing import List, Optional
from fastapi import Query
from uuid import UUID
router = APIRouter(prefix="/forms", tags=["forms"])


@router.post("/donation")
async def create_donation(donation: DonationForm):
    """
    Create a new donation entry for a donor.

    - Saves the donation to the database
    - Returns the created donation record
    """
    return save_donation(donation)

@router.post("/request")
async def create_request(request: RequestForm):
    """
    Create a new request submitted by a shelter.

    - Saves the request to the database
    - Returns the created request record
    """
    return save_request(request)

@router.put("/donation/{donation_id}")
async def update_donation(donation_id: UUID, donation: DonationForm):
    """
    Update an existing donation.

    - Applies updates to the donation record
    - Re-runs vector matching to find a new best match
    - Saves new match if generated
    - Returns both the updated donation and the best match (if any)
    """
    # Update the donation
    updated_donation = update_donation_service(donation_id, donation)

    # Find new best match
    try:
        best_match = find_best_match_for_donation(str(donation_id))
        if not best_match:
            return {
                "donation": updated_donation,
                "best_match": None
            }
        # Save and get the formatted match with generated id
        save_result = save_vector_matches([best_match])
        saved_matches = save_result.get("matches", [])
        return {
            "donation": updated_donation,
            "best_match": saved_matches[0] if saved_matches else best_match
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
    """
    Update an existing shelter request.

    - Applies updates to the request record
    - Re-runs vector matching to compute a new best match
    - Saves new match if created
    - Returns updated request and related match (if any)
    """
    # Update the request
    updated_request = update_request_service(request_id, request)

    # Find new best match
    try:
        best_match = find_best_match_for_request(str(request_id))
        if not best_match:
            return {
                "request": updated_request,
                "best_match": None
            }
        # Save and get the formatted match with generated id
        save_result = save_vector_matches([best_match])
        saved_matches = save_result.get("matches", [])
        return {
            "request": updated_request,
            "best_match": saved_matches[0] if saved_matches else best_match
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
    """
    Retrieve all donations.

    - If user_id is provided, returns donations only from that donor
    - Otherwise returns all donations in the system
    """
    return get_donations(user_id=user_id)


@router.get("/requests", response_model=List[dict])
async def list_requests(user_id: Optional[str] = Query(None)):
    """
    Retrieve all requests.

    - If user_id is provided, returns requests only from that shelter
    - Otherwise returns all requests in the system
    """
    return get_requests(user_id=user_id)

@router.delete("/donation/{donation_id}/{donor_id}")
async def delete_donation(donation_id: UUID, donor_id: str):
    """
    Delete a donation by ID, ensuring ownership via donor_id.

    - Returns success message if deletion occurs
    - Raises 404 if the donation does not exist or user mismatch
    """
    result = delete_donation_service(donation_id, donor_id)
    if result:
        return JSONResponse(status_code=200, content={"message": "Donation deleted successfully"})
    else:
        raise HTTPException(status_code=404, detail="Donation not found")

@router.delete("/request/{request_id}/{shelter_id}")
async def delete_request(request_id: UUID, shelter_id: str):
    """
    Delete a shelter request by ID, ensuring ownership via shelter_id.

    - Returns success message on deletion
    - Raises 404 if not found
    """
    result = delete_request_service(request_id, shelter_id)
    if result:
        return JSONResponse(status_code=200, content={"message": "Request deleted successfully"})
    else:
        raise HTTPException(status_code=404, detail="Request not found")

@router.put("/donor/{uid}")
async def modify_donor(
    uid: str,
    donor_update: DonorUpdate
):
    """
    Update donor profile information.

    - Updates name, username, and phone number
    - Returns updated donor record
    """
    return update_donor(
        uid=uid,
        name=donor_update.name,
        username=donor_update.username,
        phone_number=donor_update.phone_number
    )

@router.put("/shelter/{uid}")
async def modify_shelter(
    uid: str,
    shelter_update: ShelterUpdate
):
    """
    Update shelter profile information.

    - Updates shelter name, phone number, address, city, state,
    zip code, latitude, and longitude
    - Returns updated shelter record
    """
    return update_shelter(
        uid=uid,
        shelter_name=shelter_update.shelter_name,
        phone_number=shelter_update.phone_number,
        address=shelter_update.address,
        city=shelter_update.city,
        state=shelter_update.state,
        zip_code=shelter_update.zip_code,
        latitude=shelter_update.latitude,
        longitude=shelter_update.longitude
    )


@router.delete("/donor/{uid}")
async def remove_donor(uid: str):
    """
    Permanently delete a donor account by UID, together with
    all its donations.

    - Returns True if deletion succeeded
    """
    return delete_donor(uid)


@router.delete("/shelter/{uid}")
async def remove_shelter(uid: str):
    """
    Permanently delete a shelter account by UID, together with
    all its requests.

    - Returns True if deletion succeeded
    """
    return delete_shelter(uid)