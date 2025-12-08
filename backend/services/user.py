from database import engine, donors_table, shelters_table

def get_user_info_service(user_id: str):
    """
    Look up a user's profile information.

    - Checks donors table first
    - Falls back to shelters table if not found
    - Returns user type and full user record
    """
    try:
        with engine.connect() as conn:
            # First check donors table
            donor_query = donors_table.select().where(donors_table.c.uid == user_id)
            donor_result = conn.execute(donor_query).mappings().first()

            if donor_result:
                return {
                    "userType": "donor",
                    "userData": dict(donor_result)
                }

            # If not found in donors, check shelters table
            shelter_query = shelters_table.select().where(shelters_table.c.uid == user_id)
            shelter_result = conn.execute(shelter_query).mappings().first()

            if shelter_result:
                return {
                    "userType": "shelter",
                    "userData": dict(shelter_result)
                }

            return {"error": "User not found"}
    except Exception as e:
        return {"error": f"Database error: {str(e)}"}