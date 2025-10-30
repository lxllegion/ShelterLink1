from sqlalchemy import create_engine, MetaData, Table, Column, String
from sqlalchemy.dialects.postgresql import UUID

# Database connection (same as signup.py)
DATABASE_URL = f"postgresql://postgres.ukfpqtjwmutklagjssqp:uwcse403@aws-1-us-west-1.pooler.supabase.com:5432/postgres"
engine = create_engine(DATABASE_URL)
metadata = MetaData(schema="public")

# Define donors table
donors_table = Table(
    "donors", metadata,
    Column("id", UUID(as_uuid=True), primary_key=True),
    Column("uid", String, unique=True),
    Column("username", String, unique=True),
    Column("email", String, unique=True),
    Column("phone_number", String),
)

# Define shelters table
shelters_table = Table(
    "shelters", metadata,
    Column("id", UUID(as_uuid=True), primary_key=True),
    Column("uid", String, unique=True),
    Column("username", String, unique=True),
    Column("shelter_name", String),
    Column("email", String, unique=True),
    Column("phone_number", String),
)

def get_user_info_service(user_id: str):
    """
    Get user info from database by checking both donors and shelters tables
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