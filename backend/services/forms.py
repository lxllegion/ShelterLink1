import json
import os
from schemas.forms import DonationForm, RequestForm,DonationRead, RequestRead
from typing import List, Optional
from database import engine
from services.embeddings import generate_embedding
from database import requests_table, donations_table, donors_table
from sqlalchemy import insert, select, update

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

def save_donation(donation: DonationForm) -> DonationForm:
    try:
        # Step 1: Insert donation
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

            # Step 2: Update donor's donation_ids
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

        # Step 3: Return the donation form
        return DonationForm(
            donor_id=donation.donor_id,
            item_name=donation.item_name,
            quantity=donation.quantity,
            category=donation.category
        )

    except Exception as e:
        print(f"Error saving donation: {e}")
        raise e

#problemmatic, missing embedding?Still not fixed
def save_request(request: RequestForm) -> RequestForm:
    try:
        with engine.connect() as conn:

            # Step 1: Insert request with embedding
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

            # Step 2: Update shelter's request_ids
            shelter_row = conn.execute(
                select(donors_table.c.request_ids)
                .where(donors_table.c.uid == request.shelter_id)
            ).fetchone()

            if shelter_row:
                updated_ids = shelter_row.request_ids or []
                updated_ids.append(request_id)

                conn.execute(
                    update(donors_table)
                    .where(donors_table.c.uid == request.shelter_id)
                    .values(request_ids=updated_ids)
                )
                conn.commit()

        # Step 3: Return the request form
        return RequestForm(
            shelter_id=request.shelter_id,
            item_name=request.item_name,
            quantity=request.quantity,
            category=request.category
        )

    except Exception as e:
        print(f"Error saving request: {e}")
        raise e

# Get all donations
def get_donations(user_id: Optional[str] = None) -> List[DonationForm]:
    if not user_id:
        # If no user_id is provided, return all donations
        with engine.connect() as conn:
            result = conn.execute(select(donations_table)).fetchall()
        return [
            DonationForm(
                donor_id=row.donor_id,
                item_name=row.item_name,
                quantity=row.quantity,
                category=row.category
            )
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
        DonationForm(
            donor_id=row.donor_id,
            item_name=row.item_name,
            quantity=row.quantity,
            category=row.category
        )
        for row in result
    ]


def get_requests(user_id: Optional[str] = None) -> List[RequestForm]:
    if not user_id:
        with engine.connect() as conn:
            result = conn.execute(select(requests_table)).fetchall()
        return [
            RequestForm(
                shelter_id=row.shelter_id,
                item_name=row.item_name,
                quantity=row.quantity,
                category=row.category
            )
            for row in result
        ]

    with engine.connect() as conn:
        shelter_row = conn.execute(
            select(donors_table.c.request_ids)  # or whatever column tracks requests per shelter
            .where(donors_table.c.uid == user_id)
        ).fetchone()

        if not shelter_row or not shelter_row.request_ids:
            return []

        request_ids = shelter_row.request_ids
        result = conn.execute(
            select(requests_table)
            .where(requests_table.c.id.in_(request_ids))
        ).fetchall()

    return [
        RequestForm(
            shelter_id=row.shelter_id,
            item_name=row.item_name,
            quantity=row.quantity,
            category=row.category
        )
        for row in result
    ]
#work on showing up a list of donations on the profile page.
#awaiting frontend implementation




#save request and donation functions save id
#awaiting frontend implementation



#EDIT or DELETE requests and donations functions to be added later

