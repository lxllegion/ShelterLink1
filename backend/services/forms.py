import json
import os
from schemas.forms import DonationForm, RequestForm
from typing import List
from uuid import UUID
from database import engine
from services.embeddings import generate_embedding
from database import requests_table, donations_table, donors_table, shelters_table, matches_table
from sqlalchemy import insert, delete, select, update, any_, func
from services.match import delete_match
from typing import Optional
# File paths - storing data
DONATIONS_FILE = "donations.json"
REQUESTS_FILE = "requests.json"

# Initialize JSON files if they don't exist
def init_files():
    if not os.path.exists(DONATIONS_FILE):
        with open(DONATIONS_FILE, "w") as f:
            json.dump([], f)
    if not os.path.exists(REQUESTS_FILE):
        with open(REQUESTS_FILE, "w") as f:
            json.dump([], f)

def save_donation(donation: DonationForm) -> dict:
    """
    Create a new donation, generate its embedding, store it,
    and attach the donation ID to the donor's donation_ids field.
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(
                insert(donations_table)
                .values(
                    donor_id=donation.donor_id,
                    item_name=donation.item_name,
                    quantity=donation.quantity,
                    category=donation.category,
                    embedding=generate_embedding(donation.category, donation.item_name, donation.quantity)
                )
                .returning(donations_table.c.id)
            )
            conn.commit()
            donation_id = result.scalar()

            donor_row = conn.execute(
                select(donors_table.c.donation_ids)
                .where(donors_table.c.uid == donation.donor_id)
            ).fetchone()

            if donor_row:
                updated_ids = donor_row.donation_ids or []
                updated_ids.append(donation_id)

                conn.execute(
                    update(donors_table)
                    .where(donors_table.c.uid == donation.donor_id)
                    .values(donation_ids=updated_ids)
                )
                conn.commit()

        return {
            "donation_id": str(donation_id),
            "donor_id": donation.donor_id,
            "item_name": donation.item_name,
            "quantity": donation.quantity,
            "category": donation.category
        }


    except Exception as e:
        print(f"Error saving donation: {e}")
        raise e

def save_request(request: RequestForm) -> dict:
    """
    Create a new request, generate its embedding, store it,
    and attach the request ID to the shelter's request_ids field.
    """
    try:
        with engine.connect() as conn:

            embedding = generate_embedding(
                request.category,
                request.item_name,
                request.quantity
            )

            result = conn.execute(
                insert(requests_table)
                .values(
                    shelter_id=request.shelter_id,
                    item_name=request.item_name,
                    quantity=request.quantity,
                    category=request.category,
                    embedding=embedding
                )
                .returning(requests_table.c.id)
            )
            conn.commit()
            request_id = result.scalar()

            shelter_row = conn.execute(
                select(shelters_table.c.request_ids)
                .where(shelters_table.c.uid == request.shelter_id)
            ).fetchone()

            if shelter_row:
                updated_ids = shelter_row.request_ids or []
                updated_ids.append(request_id)

                conn.execute(
                    update(shelters_table)
                    .where(shelters_table.c.uid == request.shelter_id)
                    .values(request_ids=updated_ids)
                )
                conn.commit()

        return {
            "request_id": str(request_id),
            "shelter_id": request.shelter_id,
            "item_name": request.item_name,
            "quantity": request.quantity,
            "category": request.category
        }
    except Exception as e:
        print(f"Error saving request: {e}")
        raise e

# Get all donations
def get_donations(user_id: Optional[str] = None) -> List[dict]:
    """
    Retrieve all donations or only the donations
    associated with a specific donor.
    """
    if not user_id:
        # If no user_id is provided, return all donations
        with engine.connect() as conn:
            result = conn.execute(select(donations_table)).fetchall()
        return [
            {
                "donation_id": str(row.id),
                "donor_id": row.donor_id,
                "item_name": row.item_name,
                "quantity": row.quantity,
                "category": row.category
            }
            for row in result
        ]

    # Step 1: get donation_ids for this donor
    with engine.connect() as conn:
        donor_row = conn.execute(
            select(donors_table.c.donation_ids)
            .where(donors_table.c.uid == user_id)
        ).fetchone()

        if not donor_row or not donor_row.donation_ids:
            return []

        donation_ids = donor_row.donation_ids

        # Step 2: fetch donations matching those IDs
        result = conn.execute(
            select(donations_table)
            .where(donations_table.c.id.in_(donation_ids))
        ).fetchall()

    return [
        {
            "donation_id": str(row.id),
            "donor_id": row.donor_id,
            "item_name": row.item_name,
            "quantity": row.quantity,
            "category": row.category
        }
        for row in result
    ]


def get_requests(user_id: Optional[str] = None) -> List[dict]:
    """
    Retrieve all requests or only the requests
    associated with a specific shelter.
    """
    if not user_id:
        with engine.connect() as conn:
            result = conn.execute(select(requests_table)).fetchall()
        return [
            {
                "request_id": str(row.id),
                "shelter_id": row.shelter_id,
                "item_name": row.item_name,
                "quantity": row.quantity,
                "category": row.category
            }
            for row in result
          ]

    with engine.connect() as conn:
        shelter_row = conn.execute(
            select(shelters_table.c.request_ids)
            .where(shelters_table.c.uid == user_id)
        ).fetchone()

        if not shelter_row or not shelter_row.request_ids:
            return []

        request_ids = shelter_row.request_ids
        result = conn.execute(
            select(requests_table)
            .where(requests_table.c.id.in_(request_ids))
        ).fetchall()

    return [
        {
            "request_id": str(row.id),
            "shelter_id": row.shelter_id,
            "item_name": row.item_name,
            "quantity": row.quantity,
            "category": row.category
        }
        for row in result
    ]

def get_match_from_donation_id(donor_id: str, donation_id: UUID) -> Optional[str]:
    """
    Check through the donor's list of match_ids and find a match with the given donation_id.
    Returns the match_id if found, None otherwise.
    """
    try:
        with engine.connect() as conn:
            # Get the donor's match_ids array (query by uid, not id)
            result = conn.execute(
                select(donors_table.c.match_ids).where(donors_table.c.uid == donor_id)
            ).fetchone()

            if not result or not result[0]:
                # No donor found or no match_ids
                return None

            match_ids = result[0]  # This is the array of match_ids

            # Check each match_id to see if it has the same donation_id
            for match_id in match_ids:
                match_result = conn.execute(
                    select(matches_table).where(matches_table.c.id == match_id)
                ).fetchone()

                if match_result and str(match_result.donation_id) == str(donation_id):
                    return str(match_result.id)

            return None
    except Exception as e:
        print(f"Error getting match with donation ID: {e}")
        import traceback
        traceback.print_exc()
        return None

def get_match_from_request_id(shelter_id: str, request_id: UUID) -> Optional[str]:
    """
    Check through the shelter's list of match_ids and find a match with the given request_id.
    Returns the match_id if found, None otherwise.
    """
    try:
        with engine.connect() as conn:
            # Get the shelter's match_ids array (query by uid, not id)
            result = conn.execute(
                select(shelters_table.c.match_ids).where(shelters_table.c.uid == shelter_id)
            ).fetchone()

            if not result or not result[0]:
                # No shelter found or no match_ids
                return None

            match_ids = result[0]  # This is the array of match_ids

            # Check each match_id to see if it has the same request_id
            for match_id in match_ids:
                match_result = conn.execute(
                    select(matches_table).where(matches_table.c.id == match_id)
                ).fetchone()

                if match_result and str(match_result.request_id) == str(request_id):
                    return str(match_result.id)

            return None
    except Exception as e:
        print(f"Error getting match with request ID: {e}")
        import traceback
        traceback.print_exc()
        return None

def delete_donation(donation_id: UUID, donor_id: str) -> bool:
    """
    Delete a donation by:
    1. Deleting the donation from donations_table
    2. Deleting the donation_id from the donor's donation_ids array
    3. Checking through the donor's match_ids and deleting any match with the same donation_id
    """
    try:
        with engine.connect() as conn:
            print(f"Attempting to delete donation with ID: {donation_id} (type: {type(donation_id)})")

            # Step 1: Delete the donation from donations_table
            result = conn.execute(delete(donations_table).where(donations_table.c.id == donation_id))
            conn.commit()

            if result.rowcount == 0:
                print(f"Donation {donation_id} not found in database")
                return False

            # Step 2: Check through donor's match_ids and delete any match with this donation_id
            match_id = get_match_from_donation_id(donor_id, donation_id)
            if match_id:
                print(f"Found match {match_id} with donation {donation_id}, deleting...")
                delete_match(match_id)
            else:
                print(f"No matches found with donation {donation_id}")

            # Step 3: Delete the donation_id from donor's donation_ids array (query by uid, not id)
            conn.execute(
                update(donors_table)
                .where(donors_table.c.uid == donor_id)
                .values(donation_ids=func.array_remove(donors_table.c.donation_ids, str(donation_id)))
            )

            conn.commit()
            print(f"Successfully deleted donation {donation_id}")
            return True
    except Exception as e:
        print(f"Error deleting donation: {e}")
        import traceback
        traceback.print_exc()
        return False

def delete_request(request_id: UUID, shelter_id: str) -> bool:
    """
    Delete a request by:
    1. Deleting the request from requests_table
    2. Deleting the request_id from the shelter's request_ids array
    3. Checking through the shelter's match_ids and deleting any match with the same request_id
    """
    try:
        with engine.connect() as conn:
            print(f"Attempting to delete request with ID: {request_id} (type: {type(request_id)})")

            # Step 1: Delete the request from requests_table
            result = conn.execute(delete(requests_table).where(requests_table.c.id == request_id))
            conn.commit()

            if result.rowcount == 0:
                print(f"Request {request_id} not found in database")
                return False

            # Step 2: Check through shelter's match_ids and delete any match with this request_id
            match_id = get_match_from_request_id(shelter_id, request_id)
            if match_id:
                print(f"Found match {match_id} with request {request_id}, deleting...")
                delete_match(match_id)
            else:
                print(f"No matches found with request {request_id}")

            # Step 3: Delete the request_id from shelter's request_ids array (query by uid, not id)
            conn.execute(
                update(shelters_table)
                .where(shelters_table.c.uid == shelter_id)
                .values(request_ids=func.array_remove(shelters_table.c.request_ids, str(request_id)))
            )

            conn.commit()
            print(f"Successfully deleted request {request_id}")
            return True
    except Exception as e:
        print(f"Error deleting request: {e}")
        import traceback
        traceback.print_exc()
        return False

def update_donation(donation_id: UUID, donation: RequestForm) -> DonationForm:
    """
    Update a donation's fields and embedding,
    then remove any existing match involving this donation.
    """
    try:
        with engine.connect() as conn:
            # First, get the actual donation from the database to get the real donor_id
            donation_result = conn.execute(
                select(donations_table).where(donations_table.c.id == donation_id)
            ).fetchone()

            if not donation_result:
                raise ValueError(f"Donation {donation_id} not found")

            actual_donor_id = donation_result.donor_id

            # Generate new embedding with updated data
            new_embedding = generate_embedding(donation.category, donation.item_name, donation.quantity)

            # Update the donation with new data and embedding
            conn.execute(update(donations_table).where(donations_table.c.id == donation_id).values(
                item_name=donation.item_name,
                quantity=donation.quantity,
                category=donation.category,
                embedding=new_embedding
            ))

            # Use the actual donor_id from the database, not from the request
            match_id = get_match_from_donation_id(actual_donor_id, donation_id)
            if match_id:
                print(f"Found match {match_id}, deleting...")
                delete_match(match_id)
            else:
                print(f"No matches found with donation {donation_id}")

            conn.commit()
            return {"id": donation_id, **donation.model_dump()}
    except Exception as e:
        print(f"Error updating donation: {e}")
        raise e

def update_request(request_id: str, request: RequestForm) -> RequestForm:
    """
    Update a request's fields and embedding,
    then remove any existing match involving this request.
    """
    try:
        with engine.connect() as conn:
            # First, get the actual request from the database to get the real shelter_id
            request_result = conn.execute(
                select(requests_table).where(requests_table.c.id == request_id)
            ).fetchone()

            if not request_result:
                raise ValueError(f"Request {request_id} not found")

            actual_shelter_id = request_result.shelter_id

            # Generate new embedding with updated data
            new_embedding = generate_embedding(request.category, request.item_name, request.quantity)

            # Update the request with new data and embedding
            conn.execute(update(requests_table).where(requests_table.c.id == request_id).values(
                item_name=request.item_name,
                quantity=request.quantity,
                category=request.category,
                embedding=new_embedding
            ))

            # Use the actual shelter_id from the database, not from the request
            match_id = get_match_from_request_id(actual_shelter_id, request_id)
            if match_id:
                print(f"Found match {match_id}, deleting...")
                delete_match(match_id)

            else:
                print(f"No matches found with request {request_id}")
            conn.commit()
            return {"id": request_id, **request.model_dump()}
    except Exception as e:
        print(f"Error updating request: {e}")
        raise e


def update_donor(
    uid: str,
    name: Optional[str] = None,
    username: Optional[str] = None,
    phone_number: Optional[str] = None
) -> dict:
    """
    Update donor profile fields (name, username, phone number).
    Only updates fields provided by the caller.
    Returns the updated donor record as a dictionary.
    """
    if not any([name, username, phone_number]):
        raise ValueError("At least one field to update must be provided")

    try:
        with engine.connect() as conn:
            # Check if donor exists
            donor_row = conn.execute(
                select(donors_table).where(donors_table.c.uid == uid)
            ).fetchone()

            if not donor_row:
                raise ValueError(f"No donor found with uid {uid}")

            # Build update values
            update_values = {
                key: value for key, value in {
                    "name": name,
                    "username": username,
                    "phone_number": phone_number,
                }.items() if value is not None
            }

            if update_values:
                conn.execute(
                    update(donors_table)
                    .where(donors_table.c.uid == uid)
                    .values(**update_values)
                )
                conn.commit()

            # Fetch updated row
            updated = conn.execute(
                select(donors_table).where(donors_table.c.uid == uid)
            ).fetchone()

            # Return dictionary
            return {
                "uid": updated.uid,
                "name": updated.name,
                "username": updated.username,
                "phone_number": updated.phone_number
            }

    except Exception as e:
        print(f"Error updating donor: {e}")
        raise e


def update_shelter(
    uid: str,
    shelter_name: Optional[str] = None,
    phone_number: Optional[str] = None,
    address: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    zip_code: Optional[str] = None,
    latitude: Optional[str] = None,
    longitude: Optional[str] = None
) -> dict:
    """
    Update shelter profile fields (name, phone number, address, city,
    state, zip code, latitude, longitude).
    Only updates fields provided by the caller.
    Returns the updated shelter record as a dictionary.
    """
    if not any([shelter_name, phone_number, address, city, state, zip_code, latitude, longitude]):
        raise ValueError("At least one field to update must be provided")

    try:
        with engine.connect() as conn:
            shelter_row = conn.execute(
                select(shelters_table).where(shelters_table.c.uid == uid)
            ).fetchone()

            if not shelter_row:
                raise ValueError(f"No shelter found with uid {uid}")

            update_values = {
                key: value for key, value in {
                    "shelter_name": shelter_name,
                    "phone_number": phone_number,
                    "address": address,
                    "city": city,
                    "state": state,
                    "zip_code": zip_code,
                    "latitude": latitude,
                    "longitude": longitude,
                }.items() if value is not None
            }

            if update_values:
                conn.execute(
                    update(shelters_table)
                    .where(shelters_table.c.uid == uid)
                    .values(**update_values)
                )
                conn.commit()

            updated = conn.execute(
                select(shelters_table).where(shelters_table.c.uid == uid)
            ).fetchone()

            return {
                "uid": updated.uid,
                "shelter_name": updated.shelter_name,
                "phone_number": updated.phone_number,
                "address": updated.address,
                "city": updated.city,
                "state": updated.state,
                "zip_code": updated.zip_code,
                "latitude": updated.latitude,
                "longitude": updated.longitude
            }

    except Exception as e:
        print(f"Error updating shelter: {e}")
        raise e


def delete_donor(uid: str) -> bool:
    """
    Delete a donor and all donations linked to it.
    Calls delete_donation() on each donation ID stored in donation_ids.
    """
    try:
        with engine.connect() as conn:
            # Fetch donor row
            donor_row = conn.execute(
                select(donors_table).where(donors_table.c.uid == uid)
            ).fetchone()

            if not donor_row:
                raise ValueError(f"No donor found with uid {uid}")

            # Directly access the list of UUIDs
            donation_ids = donor_row.donation_ids  # Already List[UUID]

        # Delete each donation record
        for donation_id in donation_ids:
            try:
                delete_donation(donation_id=donation_id, donor_id=uid)
            except Exception as e:
                print(f"Error deleting donation {donation_id} for donor {uid}: {e}")
                raise

        # Now delete the donor itself
        with engine.connect() as conn:
            conn.execute(
                delete(donors_table).where(donors_table.c.uid == uid)
            )

            try:
                conn.commit()
            except Exception:
                pass  # depending on connection behavior

        return True

    except Exception as e:
        print(f"Error deleting donor {uid}: {e}")
        raise e


def delete_shelter(uid: str) -> bool:
    """
    Delete a shelter and all requests linked to it.
    Calls delete_request() on each request ID stored in request_ids.
    """
    try:
        with engine.connect() as conn:
            # Fetch shelter row
            shelter_row = conn.execute(
                select(shelters_table).where(shelters_table.c.uid == uid)
            ).fetchone()

            if not shelter_row:
                raise ValueError(f"No shelter found with uid {uid}")

            # Already a List[UUID]
            request_ids = shelter_row.request_ids

        # Delete each request linked to the shelter
        for request_id in request_ids:
            try:
                delete_request(request_id=request_id, shelter_id=uid)
            except Exception as e:
                print(f"Error deleting request {request_id} for shelter {uid}: {e}")
                raise

        # Now delete the shelter itself
        with engine.connect() as conn:
            conn.execute(
                delete(shelters_table).where(shelters_table.c.uid == uid)
            )

            try:
                conn.commit()
            except Exception:
                pass

        return True

    except Exception as e:
        print(f"Error deleting shelter {uid}: {e}")
        raise e