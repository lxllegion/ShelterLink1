from fastapi import APIRouter, HTTPException
from services.shelters import get_all_shelters_service

router = APIRouter(prefix="/shelters", tags=["shelters"])

# Endpoint to get all shelters
@router.get("/")
async def get_all_shelters():
    result = get_all_shelters_service()
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result
