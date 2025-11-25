"""
Vector-based matching service using pgvector for semantic similarity between donations and requests
"""
from sqlalchemy import select, text, insert
from database import engine, donations_table, requests_table, donors_table, shelters_table, matches_table
from typing import List, Dict, Any, Optional
from services.match import save_matches
from datetime import datetime
import uuid
from services.email_utils import send_match_emails

def find_similar_requests(donation_id: str, limit: int = 10, threshold: float = 0.7) -> List[Dict[str, Any]]:
    """
    Find shelter requests that are similar to a specific donation using cosine similarity
    
    Args:
        donation_id: UUID of the donation to match
        limit: Maximum number of matches to return (default: 10)
        threshold: Minimum similarity score 0-1, where 1 is identical (default: 0.7)
    
    Returns:
        List of matching requests with similarity scores, sorted by similarity (highest first)
        
    Example:
        matches = find_similar_requests("123e4567-e89b-12d3-a456-426614174000", limit=5, threshold=0.8)
        # Returns: [{"request_id": "...", "similarity_score": 0.95, ...}, ...]
    """
    try:
        with engine.connect() as conn:
            # Get the donation and its embedding
            donation = conn.execute(
                select(donations_table).where(donations_table.c.id == donation_id)
            ).fetchone()
            
            if not donation:
                print(f"Donation {donation_id} not found")
                return []
            
            # Get donor info to include in match (required by Match schema)
            donor = conn.execute(
                select(donors_table).where(donors_table.c.uid == donation.donor_id)
            ).fetchone()
            donor_name = donor.name if donor else "Unknown"
            
            # Find similar requests using cosine similarity
            # <=> is the cosine distance operator (0 = identical, 2 = opposite)
            # 1 - cosine_distance = cosine_similarity (0 = opposite, 1 = identical)
            # Convert embedding to proper format for pgvector
            if donation.embedding is None:
                print(f"Donation {donation_id} has no embedding")
                return []
            # Format embedding as comma-separated list for pgvector
            embedding_list = donation.embedding.tolist() if hasattr(donation.embedding, 'tolist') else list(donation.embedding)
            embedding_str = '[' + ','.join(map(str, embedding_list)) + ']'
            
            query = text("""
                SELECT 
                    r.id,
                    r.shelter_id,
                    r.item_name,
                    r.quantity,
                    r.category,
                    r.created_at,
                    s.shelter_name,
                    s.email as shelter_email,
                    s.phone_number as shelter_phone,
                    1 - (r.embedding <=> CAST(:embedding AS vector)) as similarity
                FROM requests r
                LEFT JOIN shelters s ON r.shelter_id = s.uid
                WHERE 1 - (r.embedding <=> CAST(:embedding AS vector)) > :threshold
                ORDER BY r.embedding <=> CAST(:embedding AS vector)
                LIMIT :limit
            """)
            
            results = conn.execute(
                query, 
                {
                    "embedding": embedding_str,
                    "threshold": threshold,
                    "limit": limit
                }
            ).fetchall()
            
            matches = []
            for row in results:
                print("donation_id: ", donation.id)
                print("request_id: ", row.id)
                match = {
                    "request_id": row.id,
                    "donor_id": donation.donor_id,
                    "donor_name": donor_name,
                    "shelter_id": row.shelter_id,
                    "shelter_name": row.shelter_name,
                    "shelter_email": row.shelter_email,
                    "shelter_phone": row.shelter_phone,
                    "item_name": row.item_name,
                    "quantity": row.quantity,
                    "category": row.category,
                    "created_at": str(row.created_at) if row.created_at else None,
                    "similarity_score": round(float(row.similarity), 4),
                    "donation_has": donation.quantity,
                    "shelter_needs": row.quantity,
                    "can_fulfill": "full" if donation.quantity >= row.quantity else "partial",
                    "donation_id": donation.id,
                }
                matches.append(match)
            
            return matches
            
    except Exception as e:
        print(f"Error finding similar requests: {e}")
        return []


def find_similar_donations(request_id: str, limit: int = 10, threshold: float = 0.7) -> List[Dict[str, Any]]:
    """
    Find donations that match a specific shelter request using cosine similarity
    
    Args:
        request_id: UUID of the request to match
        limit: Maximum number of matches to return (default: 10)
        threshold: Minimum similarity score 0-1, where 1 is identical (default: 0.7)
    
    Returns:
        List of matching donations with similarity scores, sorted by similarity (highest first)
        
    Example:
        matches = find_similar_donations("123e4567-e89b-12d3-a456-426614174000", limit=5, threshold=0.8)
        # Returns: [{"donation_id": "...", "similarity_score": 0.92, ...}, ...]
    """
    try:
        with engine.connect() as conn:
            # Get the request and its embedding
            request = conn.execute(
                select(requests_table).where(requests_table.c.id == request_id)
            ).fetchone()
            
            if not request:
                print(f"Request {request_id} not found")
                return []
            
            # Get shelter info to include in match (required by Match schema)
            shelter = conn.execute(
                select(shelters_table).where(shelters_table.c.uid == request.shelter_id)
            ).fetchone()
            shelter_name = shelter.shelter_name if shelter else "Unknown"
            
            # Find similar donations using cosine similarity
            # Convert embedding to proper format for pgvector
            if request.embedding is None:
                print(f"Request {request_id} has no embedding")
                return []
            # Format embedding as comma-separated list for pgvector
            embedding_list = request.embedding.tolist() if hasattr(request.embedding, 'tolist') else list(request.embedding)
            embedding_str = '[' + ','.join(map(str, embedding_list)) + ']'
            
            query = text("""
                SELECT 
                    d.id,
                    d.donor_id,
                    d.item_name,
                    d.quantity,
                    d.category,
                    d.created_at,
                    don.name as donor_name,
                    don.email as donor_email,
                    don.phone_number as donor_phone,
                    1 - (d.embedding <=> CAST(:embedding AS vector)) as similarity
                FROM donations d
                LEFT JOIN donors don ON d.donor_id = don.uid
                WHERE 1 - (d.embedding <=> CAST(:embedding AS vector)) > :threshold
                ORDER BY d.embedding <=> CAST(:embedding AS vector)
                LIMIT :limit
            """)
            
            results = conn.execute(
                query,
                {
                    "embedding": embedding_str,
                    "threshold": threshold,
                    "limit": limit
                }
            ).fetchall()
            
            matches = []
            for row in results:
                match = {
                    "donation_id": row.id,
                    "donor_id": row.donor_id,
                    "donor_name": row.donor_name,
                    "donor_email": row.donor_email,
                    "donor_phone": row.donor_phone,
                    "shelter_id": request.shelter_id,
                    "shelter_name": shelter_name,
                    "item_name": row.item_name,
                    "quantity": row.quantity,
                    "category": row.category,
                    "created_at": str(row.created_at) if row.created_at else None,
                    "similarity_score": round(float(row.similarity), 4),
                    "donor_has": row.quantity,
                    "shelter_needs": request.quantity,
                    "can_fulfill": "full" if row.quantity >= request.quantity else "partial",
                    "request_id": row.request_id,
                }
                matches.append(match)
            
            return matches
            
    except Exception as e:
        print(f"Error finding similar donations: {e}")
        return []


def find_all_matches(threshold: float = 0.7, min_quantity_match: bool = False) -> List[Dict[str, Any]]:
    """
    Find all potential matches between donations and requests in the system
    
    Args:
        threshold: Minimum similarity score 0-1 (default: 0.7)
        min_quantity_match: If True, only return matches where donation quantity >= request quantity
    
    Returns:
        List of all matches with both donation and request details
        
    Example:
        all_matches = find_all_matches(threshold=0.8, min_quantity_match=True)
    """
    try:
        with engine.connect() as conn:
            quantity_filter = ""
            if min_quantity_match:
                quantity_filter = "AND d.quantity >= r.quantity"
            
            query = text(f"""
                SELECT 
                    d.id as donation_id,
                    d.donor_id,
                    don.name as donor_name,
                    d.item_name as donation_item,
                    d.quantity as donation_quantity,
                    d.category as donation_category,
                    r.id as request_id,
                    r.shelter_id,
                    s.shelter_name,
                    r.item_name as request_item,
                    r.quantity as request_quantity,
                    r.category as request_category,
                    1 - (d.embedding <=> r.embedding) as similarity
                FROM donations d
                CROSS JOIN requests r
                LEFT JOIN donors don ON d.donor_id = don.uid
                LEFT JOIN shelters s ON r.shelter_id = s.uid
                WHERE 1 - (d.embedding <=> r.embedding) > :threshold
                {quantity_filter}
                ORDER BY similarity DESC
            """)
            
            results = conn.execute(query, {"threshold": threshold}).fetchall()
            
            matches = []
            for row in results:
                match = {
                    "donation_id": row.donation_id,
                    "donor_id": row.donor_id,
                    "donor_name": row.donor_name,
                    "donation_item": row.donation_item,
                    "donation_quantity": row.donation_quantity,
                    "donation_category": row.donation_category,
                    "request_id": row.request_id,
                    "shelter_id": row.shelter_id,
                    "shelter_name": row.shelter_name,
                    "request_item": row.request_item,
                    "request_quantity": row.request_quantity,
                    "request_category": row.request_category,
                    "similarity_score": round(float(row.similarity), 4),
                    "can_fulfill": "full" if row.donation_quantity >= row.request_quantity else "partial"
                }
                matches.append(match)
            
            return matches
            
    except Exception as e:
        print(f"Error finding all matches: {e}")
        return []


def find_best_match_for_donation(donation_id: str) -> Optional[Dict[str, Any]]:
    """
    Find the single best matching request for a donation
    
    Args:
        donation_id: UUID of the donation
    
    Returns:
        Best matching request or None if no good match found
    """
    matches = find_similar_requests(donation_id, limit=1, threshold=0.7)
    return matches[0] if matches else None


def find_best_match_for_request(request_id: str) -> Optional[Dict[str, Any]]:
    """
    Find the single best matching donation for a request
    
    Args:
        request_id: UUID of the request
    
    Returns:
        Best matching donation or None if no good match found
    """
    matches = find_similar_donations(request_id, limit=1, threshold=0.7)
    return matches[0] if matches else None


def get_matches_for_donor(donor_id: str, limit: int = 10, threshold: float = 0.7) -> List[Dict[str, Any]]:
    """
    Find all requests that match any donations from a specific donor
    
    Args:
        donor_id: Firebase UID of the donor
        limit: Maximum matches per donation
        threshold: Minimum similarity score
    
    Returns:
        List of all matches for this donor's donations
    """
    try:
        with engine.connect() as conn:
            # Get all donations from this donor
            donations = conn.execute(
                select(donations_table).where(donations_table.c.donor_id == donor_id)
            ).fetchall()
            
            all_matches = []
            for donation in donations:
                matches = find_similar_requests(str(donation.id), limit=limit, threshold=threshold)
                for match in matches:
                    match["donation_item"] = donation.item_name
                    match["donation_quantity"] = donation.quantity
                    match["donation_category"] = donation.category
                all_matches.extend(matches)
            
            # Sort by similarity score
            all_matches.sort(key=lambda x: x["similarity_score"], reverse=True)
            return all_matches
            
    except Exception as e:
        print(f"Error getting matches for donor: {e}")
        return []


def get_matches_for_shelter(shelter_id: str, limit: int = 10, threshold: float = 0.7) -> List[Dict[str, Any]]:
    """
    Find all donations that match any requests from a specific shelter
    
    Args:
        shelter_id: Firebase UID of the shelter
        limit: Maximum matches per request
        threshold: Minimum similarity score
    
    Returns:
        List of all matches for this shelter's requests
    """
    try:
        with engine.connect() as conn:
            # Get all requests from this shelter
            requests = conn.execute(
                select(requests_table).where(requests_table.c.shelter_id == shelter_id)
            ).fetchall()
            
            all_matches = []
            for request in requests:
                matches = find_similar_donations(str(request.id), limit=limit, threshold=threshold)
                for match in matches:
                    match["request_item"] = request.item_name
                    match["request_quantity"] = request.quantity
                    match["request_category"] = request.category
                all_matches.extend(matches)
            
            # Sort by similarity score
            all_matches.sort(key=lambda x: x["similarity_score"], reverse=True)
            return all_matches
            
    except Exception as e:
        print(f"Error getting matches for shelter: {e}")
        return []

def user_save_match_id(match_id: str, user_id: str, user_type: str, conn):
    """
    Add a match ID to the user's match_ids list in their table.
    Uses a connection from the parent transaction.
    
    Args:
        match_id: The UUID of the match to add
        user_id: The UID of the donor or shelter
        user_type: Either "donor" or "shelter"
        conn: SQLAlchemy connection object from parent transaction
    """
    try:
        if user_type == "donor":
            table = donors_table
        elif user_type == "shelter":
            table = shelters_table
        else:
            raise ValueError(f"Invalid user type: {user_type}")
        
        # Get current match_ids for this user
        result = conn.execute(
            select(table.c.match_ids).where(table.c.uid == user_id)
        ).fetchone()
        
        if result:
            current_match_ids = result.match_ids
            
            # Handle different data types (list, string, or None)
            if current_match_ids is None:
                match_ids_list = []
            elif isinstance(current_match_ids, list):
                # Already a list (PostgreSQL array) - convert all elements to strings
                match_ids_list = [str(mid) for mid in current_match_ids]
            elif isinstance(current_match_ids, str):
                # String format (comma-separated or empty)
                if current_match_ids.strip():
                    match_ids_list = [mid.strip() for mid in current_match_ids.split(",") if mid.strip()]
                else:
                    match_ids_list = []
            else:
                match_ids_list = []
            
            # Ensure match_id is a string
            match_id_str = str(match_id)
            
            # Add new match_id if not already present
            if match_id_str not in match_ids_list:
                match_ids_list.append(match_id_str)
            
            # Update the user's record with the list (PostgreSQL will handle array conversion)
            conn.execute(
                table.update()
                .where(table.c.uid == user_id)
                .values(match_ids=match_ids_list)
            )
            
    except Exception as e:
        print(f"Error saving match ID to {user_type} {user_id}: {e}")

def get_donor_email(conn, donor_uid: str) -> str | None:
    """
    Retrieves user email from donor table.

    Args:
        conn: The current connection to database. 
        donor_uid: The uid of the donor.

    Returns:
        The email of the donor with the given id, if it exists.
    """
    if not donor_uid:
        return None
    result = conn.execute(
        select(donors_table.c.email).where(donors_table.c.uid == donor_uid)
    ).scalar_one_or_none()
    return result

def get_shelter_email(conn, shelter_uid: str) -> str | None:
    """
    Retrieves user email from shelter table.

    Args:
        conn: The current connection to database. 
        shelter_uid: The uid of the shelter.

    Returns:
        The email of the shelter with the given id, if it exists.
    """
    if not shelter_uid:
        return None
    result = conn.execute(
        select(shelters_table.c.email).where(shelters_table.c.uid == shelter_uid)
    ).scalar_one_or_none()
    return result

def save_vector_matches(
    matches: List[Dict[str, Any]],
    save_to_file: bool = True,
    save_to_db: bool = True,
) -> Dict[str, Any]:
    """
    Save vector-based matches:
      - to JSON file (existing behavior via save_matches)
      - and to the Supabase/Postgres `matches` table.

    Args:
        matches: List of matches from find_similar_requests/donations/find_all_matches
        save_to_file: Whether to save to mock_matches.json via save_matches
        save_to_db: Whether to insert into the real `matches` SQL table

    Returns:
        Summary of saved matches
    """
    try:
        if not matches:
            return {"saved": 0, "message": "No matches to save"}

        formatted_matches: List[Dict[str, Any]] = []

        # We'll open a transaction just once if we are saving to DB
        # Use begin() instead of connect() to auto-commit the transaction
        with engine.begin() as conn:
            for raw_match in matches:
                # Generate an ID and timestamp once so JSON + DB stay in sync
                match_id = str(uuid.uuid4())
                now = datetime.utcnow()

                formatted_match = {
                    "id": match_id,
                    "donor_id": raw_match.get("donor_id", ""),
                    "donor_username": raw_match.get("donor_name", "Unknown"),
                    "shelter_id": raw_match.get("shelter_id", ""),
                    "shelter_name": raw_match.get("shelter_name", "Unknown"),
                    "item_name": raw_match.get("item_name", ""),
                    "quantity": raw_match.get("quantity", 0),
                    "category": raw_match.get("category", ""),
                    "matched_at": now.isoformat(),
                    "status": "pending",
                    "donation_id": raw_match.get("donation_id", ""),
                    "request_id": raw_match.get("request_id", ""),
                }
                formatted_matches.append(formatted_match)

                # Send email
                donor_id_email = formatted_match["donor_id"]
                shelter_id_email = formatted_match["shelter_id"]
                donor_email = get_donor_email(conn, donor_id_email)
                shelter_email = get_shelter_email(conn, shelter_id_email)
                send_match_emails(donor_email, shelter_email, formatted_match)

                if save_to_db:
                    # Insert into the matches table
                    conn.execute(
                        insert(matches_table).values(
                            id=match_id,
                            status="pending",
                            matched_at=now,
                            category=formatted_match["category"],
                            quantity=formatted_match["quantity"],
                            item_name=formatted_match["item_name"],
                            shelter_name=formatted_match["shelter_name"],
                            donor_username=formatted_match["donor_username"],
                            donor_id=formatted_match["donor_id"],
                            shelter_id=formatted_match["shelter_id"],
                            donation_id=formatted_match["donation_id"],
                            request_id=formatted_match["request_id"],
                        )
                    )
                    
                    # Add match_id to both donor and shelter match_ids lists
                    donor_id = formatted_match["donor_id"]
                    shelter_id = formatted_match["shelter_id"]
                    
                    if donor_id:
                        user_save_match_id(match_id, donor_id, "donor", conn)
                    if shelter_id:
                        user_save_match_id(match_id, shelter_id, "shelter", conn)

        # Old save to local behavior
        # if save_to_file:
        #     save_matches(formatted_matches)

        return {
            "saved": len(formatted_matches),
            "matches": formatted_matches,
        }

    except Exception as e:
        print(f"Error saving vector matches: {e}")
        return {"saved": 0, "error": str(e)}


