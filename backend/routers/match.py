from fastapi import APIRouter, HTTPException
from services.match import get_matches_service, resolve_match_db
from uuid import UUID

router = APIRouter(prefix="/match", tags=["match"])


@router.get("/matches/{user_id}/{user_type}")
async def get_matches(user_id: str, user_type: str):
    """
    Retrieve matches for a given user ID and user type (donor or shelter).
    """
    result = get_matches_service(user_id, user_type)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.put("/resolve/{match_id}/{user_uid}")
def resolve_match(match_id: UUID, user_uid: str):
    """
    Update match status when a donor or shelter confirms the match.
    Returns the new match status.
    """
    try:
        new_status = resolve_match_db(match_id, user_uid)
        return {"match_id": match_id, "status": new_status}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
