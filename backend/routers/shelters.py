from fastapi import APIRouter, HTTPException
from services.shelters import get_all_shelters_service, get_shelter_requests_service

router = APIRouter(prefix="/shelters", tags=["shelters"])


@router.get("/")
async def get_all_shelters():
    """
    Retrieve all shelters with their location information.
    """
    result = get_all_shelters_service()
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@router.get("/{shelter_id}/requests")
async def get_shelter_requests(shelter_id: str):
    """
    Retrieve all requests associated with a specific shelter.
    """
    result = get_shelter_requests_service(shelter_id)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result
