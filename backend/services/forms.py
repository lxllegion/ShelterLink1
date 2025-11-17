import json
import os
from schemas.forms import DonationForm, RequestForm
from typing import List
from database import engine
from services.embeddings import generate_embedding
from database import requests_table, donations_table
from sqlalchemy import insert, select

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
# def get_donations() -> List[DonationForm]:
#     init_files()
#     with open(DONATIONS_FILE, "r") as f:
#         donations = json.load(f)
#     return [DonationForm(**donation) for donation in donations]
def get_donations() -> List[DonationForm]:
    with engine.connect() as conn:
        result = conn.execute(select(donations_table)).fetchall()

    # Convert rows to Pydantic models
    donations = []
    for row in result:
        donations.append(DonationForm(
            donor_id=row.donor_id,
            item_name=row.item_name,
            quantity=row.quantity,
            category=row.category,
        ))
    return donations

# Get all reqs
def get_requests() -> List[RequestForm]:
    init_files()
    with open(REQUESTS_FILE, "r") as f:
        requests = json.load(f)
    return [RequestForm(**request) for request in requests]

def get_requests() -> List[RequestForm]:
    with engine.connect() as conn:
        result = conn.execute(select(requests_table)).fetchall()

    requests = []
    for row in result:
        requests.append(RequestForm(
            shelter_id=row.shelter_id,
            item_name=row.item_name,
            quantity=row.quantity,
            category=row.category,
        ))
    return requests

#work on showing up a list of donations on the profile page.
