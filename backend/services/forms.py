import json
import os
from schemas.forms import DonationForm, RequestForm,DonationRead, RequestRead
from typing import List, Optional
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

def save_donation(donation: DonationForm) -> DonationRead:
    try:
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
    except Exception as e:
        print(f"Error saving donation: {e}")
        return None


def save_request(request: RequestForm) -> RequestRead:
    try:
        with engine.connect() as conn:
            result = conn.execute(
                insert(requests_table)
                .values(
                    shelter_id=request.shelter_id,
                    item_name=request.item_name,
                    quantity=request.quantity,
                    category=request.category
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
    except Exception as e:
        print("Error saving request:", e)
        raise e

# Get all donations
def get_donations(user_id: Optional[str] = None) -> List[DonationRead]:

    with engine.connect() as conn:
        if user_id:
            result = conn.execute(
                select(donations_table).where(donations_table.c.donor_id == user_id)
            ).fetchall()
        else:
            result = conn.execute(select(donations_table)).fetchall()

    donations = [
        DonationRead(
            id=row.id,
            donor_id=row.donor_id,
            item_name=row.item_name,
            quantity=row.quantity,
            category=row.category
        )
        for row in result
    ]
    return donations

# # Get all reqs
def get_requests(user_id: Optional[str] = None) -> List[RequestRead]:
    with engine.connect() as conn:
        if user_id:
            result = conn.execute(
                select(requests_table).where(requests_table.c.shelter_id == user_id)
            ).fetchall()
        else:
            result = conn.execute(select(requests_table)).fetchall()

    requests = [
        RequestRead(
            id=row.id,
            shelter_id=row.shelter_id,
            item_name=row.item_name,
            quantity=row.quantity,
            category=row.category
        )
        for row in result
    ]
    return requests
#work on showing up a list of donations on the profile page.
#awaiting frontend implementation




#save request and donation functions save id
#awaiting frontend implementation



#EDIT or DELETE requests and donations functions to be added later