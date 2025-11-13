from database import engine, shelters_table

def get_all_shelters_service():
    """
    Get all shelters from the database with their location information
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
