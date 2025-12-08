from database import engine, shelters_table, requests_table
from sqlalchemy import select

def get_all_shelters_service():
    """
    Fetch all shelters.

    - Retrieves all shelter records from the database
    - Includes full location and contact details
    - Returns list of shelters and total count
    """
    try:
        with engine.connect() as conn:
            shelters_query = shelters_table.select()
            shelters_result = conn.execute(shelters_query).mappings().all()

            shelters_list = [dict(shelter) for shelter in shelters_result]

            return {
                "shelters": shelters_list,
                "count": len(shelters_list)
            }
    except Exception as e:
        return {"error": f"Database error: {str(e)}"}

def get_shelter_requests_service(shelter_id: str):
    """
    Fetch all requests for a shelter.

    - Retrieves all requests linked to a given shelter
    - Excludes embedding data for efficiency
    - Returns list of requests and total count
    """
    try:
        with engine.connect() as conn:
            # Select specific columns, excluding the embedding field
            requests_query = select(
                requests_table.c.id,
                requests_table.c.shelter_id,
                requests_table.c.item_name,
                requests_table.c.quantity,
                requests_table.c.category
            ).where(requests_table.c.shelter_id == shelter_id)
            requests_result = conn.execute(requests_query).mappings().all()

            requests_list = [dict(request) for request in requests_result]

            return {
                "requests": requests_list,
                "count": len(requests_list)
            }
    except Exception as e:
        return {"error": f"Database error: {str(e)}"}
