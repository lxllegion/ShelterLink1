from fastapi import APIRouter, HTTPException
from services.user import get_user_info_service

router = APIRouter(prefix="/user", tags=["user"])

# Endpoint to get user info
@router.get("/user_info/{user_id}")
async def get_user_info(user_id: str):
    result = get_user_info_service(user_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result