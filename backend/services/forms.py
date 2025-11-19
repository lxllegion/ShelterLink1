import json
import os
from schemas.forms import DonationForm, RequestForm,DonationRead, RequestRead
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
def save_donation(donation: DonationForm) -> DonationRead:
    embedding = generate_embedding(
        donation.category,
        donation.item_name,
        donation.quantity
    )

    with engine.connect() as conn:
        result = conn.execute(
            insert(donations_table)
            .values(
                donor_id=donation.donor_id,
                item_name=donation.item_name,
                quantity=donation.quantity,
                category=donation.category,
                embedding=embedding
            )
            .returning(donations_table.c.id)
        )
        conn.commit()
        donation_id = result.scalar()

    return DonationRead(
        id=donation_id,
        donor_id=donation.donor_id,
        item_name=donation.item_name,
        quantity=donation.quantity,
        category=donation.category
    )


# -----------------------------
# Save request
# -----------------------------
def save_request(request: RequestForm) -> RequestRead:
    embedding = generate_embedding(
        request.category,
        request.item_name,
        request.quantity
    )

    with engine.connect() as conn:
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

    return RequestRead(
        id=request_id,
        shelter_id=request.shelter_id,
        item_name=request.item_name,
        quantity=request.quantity,
        category=request.category
    )


# Get all donations
#tested with FastAPI
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

# # Get all reqs

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
#save request and donation functions save id
#EDIT or DELETE requests and donations functions to be added later