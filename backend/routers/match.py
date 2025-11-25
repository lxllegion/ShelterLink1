from fastapi import APIRouter, HTTPException
from services.match import get_matches_service

router = APIRouter(prefix="/match", tags=["match"])

# Endpoint to get user info
@router.get("/matches/{user_id}/{user_type}")
async def get_matches(user_id: str, user_type: str):
    result = get_matches_service(user_id, user_type)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result