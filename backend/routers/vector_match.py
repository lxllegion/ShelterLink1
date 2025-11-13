"""
API routes for vector-based matching between donations and requests
"""
from fastapi import APIRouter, Query
from services.vector_match import (
    find_similar_requests,
    find_similar_donations,
    find_all_matches,
    find_best_match_for_donation,
    find_best_match_for_request,
    get_matches_for_donor,
    get_matches_for_shelter,
    save_vector_matches
)
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/vector-match", tags=["vector-matching"])

@router.get("/donation/{donation_id}/matches")
async def get_matches_for_donation(
    donation_id: str,
    limit: int = Query(10, ge=1, le=100, description="Maximum number of matches to return"),
    threshold: float = Query(0.7, ge=0.0, le=1.0, description="Minimum similarity score (0-1)"),
    save: bool = True
) -> Dict[str, Any]:
    """
    Find shelter requests that match a specific donation using vector similarity
    
    Returns requests sorted by similarity score (highest first)
    Set save=true to automatically save matches to mock_matches.json
    """
    matches = find_similar_requests(donation_id, limit=limit, threshold=threshold)
    
    result = {
        "donation_id": donation_id,
        "matches_found": len(matches),
        "matches": matches
    }
    
    # Optionally save matches
    if save and matches:
        save_result = save_vector_matches(matches)
        result["saved"] = save_result.get("saved", 0)
    
    return result


@router.get("/request/{request_id}/matches")
async def get_matches_for_request(
    request_id: str,
    limit: int = Query(10, ge=1, le=100, description="Maximum number of matches to return"),
    threshold: float = Query(0.7, ge=0.0, le=1.0, description="Minimum similarity score (0-1)"),
    save: bool = True
) -> Dict[str, Any]:
    """
    Find donations that match a specific shelter request using vector similarity
    
    Returns donations sorted by similarity score (highest first)
    Set save=true to automatically save matches to mock_matches.json
    """
    matches = find_similar_donations(request_id, limit=limit, threshold=threshold)
    
    result = {
        "request_id": request_id,
        "matches_found": len(matches),
        "matches": matches
    }
    
    # Optionally save matches
    if save and matches:
        save_result = save_vector_matches(matches)
        result["saved"] = save_result.get("saved", 0)
    
    return result


@router.get("/donation/{donation_id}/best-match")
async def get_best_match_for_donation(donation_id: str) -> Dict[str, Any]:
    """
    Find the single best matching request for a donation
    
    Returns the highest similarity match or null if no good match found
    """
    best_match = find_best_match_for_donation(donation_id)
    
    result = {
        "donation_id": donation_id,
        "best_match": best_match
    }

    # Save
    save_result = save_vector_matches([best_match])
    result["saved"] = save_result.get("saved", 0)

    return result


@router.get("/request/{request_id}/best-match")
async def get_best_match_for_request(request_id: str) -> Dict[str, Any]:
    """
    Find the single best matching donation for a request
    
    Returns the highest similarity match or null if no good match found
    """
    best_match = find_best_match_for_request(request_id)

    result = {
        "request_id": request_id,
        "best_match": best_match
    }

    # Save
    save_result = save_vector_matches([best_match])
    result["saved"] = save_result.get("saved", 0)

    return result


@router.get("/all-matches")
async def get_all_matches(
    threshold: float = Query(0.7, ge=0.0, le=1.0, description="Minimum similarity score (0-1)"),
    min_quantity_match: bool = Query(False, description="Only show matches where donation >= request quantity")
) -> Dict[str, Any]:
    """
    Find all potential matches between all donations and requests in the system
    
    Useful for getting an overview of all possible matches
    """
    matches = find_all_matches(threshold=threshold, min_quantity_match=min_quantity_match)
    
    result = {
        "total_matches": len(matches),
        "matches": matches
    }

    # Save
    save_result = save_vector_matches(matches)
    result["saved"] = save_result.get("saved", 0)

    return result


@router.get("/donor/{donor_id}/matches")
async def get_donor_matches(
    donor_id: str,
    limit: int = Query(10, ge=1, le=100, description="Maximum matches per donation"),
    threshold: float = Query(0.7, ge=0.0, le=1.0, description="Minimum similarity score (0-1)")
) -> Dict[str, Any]:
    """
    Find all requests that match ANY donations from a specific donor
    
    Returns all matches for this donor's donations, sorted by similarity
    """
    matches = get_matches_for_donor(donor_id, limit=limit, threshold=threshold)
    
    result = {
        "donor_id": donor_id,
        "total_matches": len(matches),
        "matches": matches
    }

    # Save
    save_result = save_vector_matches(matches)
    result["saved"] = save_result.get("saved", 0)

    return result


@router.get("/shelter/{shelter_id}/matches")
async def get_shelter_matches(
    shelter_id: str,
    limit: int = Query(10, ge=1, le=100, description="Maximum matches per request"),
    threshold: float = Query(0.7, ge=0.0, le=1.0, description="Minimum similarity score (0-1)")
) -> Dict[str, Any]:
    """
    Find all donations that match ANY requests from a specific shelter
    
    Returns all matches for this shelter's requests, sorted by similarity
    """
    matches = get_matches_for_shelter(shelter_id, limit=limit, threshold=threshold)
    
    result = {
        "shelter_id": shelter_id,
        "total_matches": len(matches),
        "matches": matches
    }

    # Save
    save_result = save_vector_matches(matches)
    result["saved"] = save_result.get("saved", 0)

    return result

