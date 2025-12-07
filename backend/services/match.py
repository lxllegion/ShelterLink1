from schemas.match import Match
import json
from typing import List, Dict, Any
from database import engine, donors_table, shelters_table, matches_table
from schemas.forms import DonationForm
from schemas.forms import RequestForm
from sqlalchemy import text, delete, update, select, func
from sqlalchemy.orm import sessionmaker
from uuid import UUID

def get_matches_service(user_id: str, user_type: str):
    try:
        with engine.connect() as conn:
            # get match_ids array from user table
            if user_type == "donor":
                result = conn.execute(
                    donors_table.select().where(donors_table.c.uid == user_id)
                ).fetchone()
                if not result:
                    return {"error": f"Donor with uid {user_id} not found"}
                match_ids = result.match_ids
            elif user_type == "shelter":
                result = conn.execute(
                    shelters_table.select().where(shelters_table.c.uid == user_id)
                ).fetchone()
                if not result:
                    return {"error": f"Shelter with uid {user_id} not found"}
                match_ids = result.match_ids
            else:
                return {"error": "Invalid user type"}

            # If no match_ids or empty array, return empty matches
            if not match_ids:
                return {"matches": []}

            # get matches from matches table with the array of match_ids
            matches = conn.execute(matches_table.select().where(matches_table.c.id.in_(match_ids))).fetchall()

            # Convert rows to dictionaries and enrich with contact information
            matches_list = []
            for row in matches:
                match_dict = dict(row._mapping)

                # Fetch donor contact information
                donor = conn.execute(
                    donors_table.select().where(donors_table.c.uid == match_dict['donor_id'])
                ).fetchone()
                if donor:
                    match_dict['donor_email'] = donor.email
                    match_dict['donor_phone'] = donor.phone_number

                # Fetch shelter contact information
                shelter = conn.execute(
                    shelters_table.select().where(shelters_table.c.uid == match_dict['shelter_id'])
                ).fetchone()
                if shelter:
                    match_dict['shelter_email'] = shelter.email
                    match_dict['shelter_phone'] = shelter.phone_number
                    match_dict['shelter_address'] = shelter.address
                    match_dict['shelter_city'] = shelter.city
                    match_dict['shelter_state'] = shelter.state
                    match_dict['shelter_zip_code'] = shelter.zip_code

                matches_list.append(match_dict)

            return {"matches": matches_list}
    except Exception as e:
        return {"error": str(e)}
    
def load_json(file_path: str) -> List[Dict[Any, Any]]:
    with open(file_path, 'r') as f:
        return json.load(f)

def save_matches(new_matches: list):
    """
    Save new matches
    """
    try:
        # Existing
        try:
            with open("data/mock_matches.json", "r") as f:
                existing = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            existing = []

        # Add new
        existing.extend(new_matches)

        # Save
        with open("data/mock_matches.json", "w") as f:
            json.dump(existing, f, indent=2)
    except Exception as e:
        print(f"Error saving matches: {e}")

def delete_match(match_id: UUID):
    """
    Delete a match
    """
    try:
        with engine.connect() as conn:
            # delete match_id from donor and shelter match_ids arrays
            match = conn.execute(select(matches_table).where(matches_table.c.id == match_id)).fetchone()
            donor_id = match.donor_id
            shelter_id = match.shelter_id
            # delete match_id from donor and shelter match_ids arrays
            conn.execute(update(donors_table).where(donors_table.c.uid == donor_id).values(match_ids=func.array_remove(donors_table.c.match_ids, match_id)))
            conn.execute(update(shelters_table).where(shelters_table.c.uid == shelter_id).values(match_ids=func.array_remove(shelters_table.c.match_ids, match_id)))
            conn.execute(delete(matches_table).where(matches_table.c.id == match_id))
            conn.commit()
            return True
    except Exception as e:
        print(f"Error deleting match: {e}")
        return False
    
SessionLocal = sessionmaker(bind=engine)

def resolve_match_db(match_id: UUID, user_uid: UUID) -> str:
    """
    Resolves matches based on donor/shelter confirmation
    """
    session = SessionLocal()
    try:
        # Get current match record
        match = session.execute(
            matches_table.select().where(matches_table.c.id == match_id)
        ).first()

        if not match:
            raise ValueError(f"No match found with id {match_id}")

        match_dict = match._asdict()
        current_status = match_dict["status"]

        # Determine if the user who confirmed is a shelter/donor
        if user_uid == match_dict["donor_id"]:
            user_is_donor = True
        elif user_uid == match_dict["shelter_id"]:
            user_is_donor = False
        else:
            raise PermissionError("User is not part of this match")

        new_status = resolve_match_status(current_status, user_is_donor)

        # Update only if changed
        if new_status != current_status:
            session.execute(
                update(matches_table)
                .where(matches_table.c.id == match_id)
                .values(status=new_status)
            )
            session.commit()

        return new_status

    finally:
        session.close()

def resolve_match_status(current_status: str, user_is_donor: bool) -> str:
    """
    Pure logic: given current status and whether current user is donor,
    decide the new match status.
    """
    if current_status == "pending":
        return "donor" if user_is_donor else "shelter"

    if current_status == "donor" and not user_is_donor:
        return "both"  # shelter confirms after donor

    if current_status == "shelter" and user_is_donor:
        return "both"  # donor confirms after shelter

    return current_status  # No change if both or same user confirms