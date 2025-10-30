from fastapi import APIRouter, HTTPException
from services.match import get_matches_service

router = APIRouter(prefix="/match", tags=["match"])

# Endpoint to get user info
@router.get("/matches")
async def get_matches():
    result = get_matches_service()
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result