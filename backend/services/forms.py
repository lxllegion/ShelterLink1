import json
import os
from schemas.forms import DonationForm, RequestForm
from typing import List
from uuid import UUID
from database import engine
from services.embeddings import generate_embedding
from database import requests_table, donations_table, donors_table, shelters_table
from sqlalchemy import insert, delete, select, update, any_
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

# Save donation form
def save_donation(donation: DonationForm) -> DonationForm:
    try:
        embedding = generate_embedding(donation.category, donation.item_name, donation.quantity)
        with engine.connect() as conn:
            result = conn.execute(insert(donations_table).values(
                donor_id=donation.donor_id,
                item_name=donation.item_name,
                quantity=donation.quantity,
                category=donation.category,
                embedding=embedding
            ).returning(donations_table.c.id))
            conn.commit()
            donation_id = result.fetchone()[0]
        return {"id": str(donation_id), **donation.model_dump()}

    except Exception as e:
        print(f"Error saving request: {e}")  # Add logging
        raise e  # Re-raise to get proper error response


# Save req form
def save_request(request: RequestForm) -> dict:
    try:
        embedding = generate_embedding(request.category, request.item_name, request.quantity)
        with engine.connect() as conn:
            result = conn.execute(insert(requests_table).values(
                shelter_id=request.shelter_id,
                item_name=request.item_name,
                quantity=request.quantity,
                category=request.category,
                embedding=embedding
            ).returning(requests_table.c.id))
            conn.commit()
            request_id = result.fetchone()[0]
        return {"id": str(request_id), **request.model_dump()}

    except Exception as e:
        print(f"Error saving request: {e}")  # Add logging
        raise e  # Re-raise to get proper error response

# Get all donations
def get_donations() -> List[DonationForm]:
    init_files()
    with open(DONATIONS_FILE, "r") as f:
        donations = json.load(f)
    return [DonationForm(**donation) for donation in donations]

# Get all reqs
def get_requests() -> List[RequestForm]:
    init_files()
    with open(REQUESTS_FILE, "r") as f:
        requests = json.load(f)
    return [RequestForm(**request) for request in requests]

def delete_donation(donation_id: UUID) -> bool:
    try:
        with engine.connect() as conn:
            print(f"Attempting to delete donation with ID: {donation_id} (type: {type(donation_id)})")
            result = conn.execute(delete(donations_table).where(donations_table.c.id == donation_id))
            conn.commit()
            print(f"Delete result rowcount: {result.rowcount}")
            if result.rowcount == 0:
                print(f"Donation {donation_id} not found in database")
                return False
            
            # Optional cleanup: remove from donor's donation_ids array (stored as string UUIDs)
            # Using PostgreSQL array operation with any_()
            try:
                conn.execute(
                    update(donors_table)
                    .where(str(donation_id) == any_(donors_table.c.donation_ids))
                    .values(donation_ids=None)  # This could be improved to remove just the one ID
                )
                conn.commit()
            except Exception as cleanup_error:
                print(f"Warning: Could not clean up donor arrays: {cleanup_error}")
                # Continue anyway - the main deletion succeeded
            
            print(f"Successfully deleted donation {donation_id}")
            return True
    except Exception as e:
        print(f"Error deleting donation: {e}")
        import traceback
        traceback.print_exc()
        return False

def delete_request(request_id: UUID) -> bool:
    try:
        with engine.connect() as conn:
            print(f"Attempting to delete request with ID: {request_id} (type: {type(request_id)})")
            result = conn.execute(delete(requests_table).where(requests_table.c.id == request_id))
            conn.commit()
            print(f"Delete result rowcount: {result.rowcount}")
            if result.rowcount == 0:
                print(f"Request {request_id} not found in database")
                return False
            
            # Optional cleanup: remove from shelter's request_ids array (stored as string UUIDs)
            # Using PostgreSQL array operation with any_()
            try:
                conn.execute(
                    update(shelters_table)
                    .where(str(request_id) == any_(shelters_table.c.request_ids))
                    .values(request_ids=None)  # This could be improved to remove just the one ID
                )
                conn.commit()
            except Exception as cleanup_error:
                print(f"Warning: Could not clean up shelter arrays: {cleanup_error}")
                # Continue anyway - the main deletion succeeded
            
            print(f"Successfully deleted request {request_id}")
            return True
    except Exception as e:
        print(f"Error deleting request: {e}")
        import traceback
        traceback.print_exc()
        return False