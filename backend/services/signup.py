from sqlalchemy import create_engine, MetaData, Table, Column, String, text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from schemas.donor import DonorRegister
from schemas.shelter import ShelterRegister

# Database connection
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


def create_donor(donor: DonorRegister):
    """
    Save donor to database
    """
    try:
        with engine.connect() as conn:
            trans = conn.begin()
            
            ins = donors_table.insert().values(
                id=uuid.uuid4(),
                uid=donor.userID,
                username=donor.username,
                email=donor.email,
                phone_number=donor.phone_number,
            ).returning(donors_table.c.id, donors_table.c.username, donors_table.c.email)
            
            row = conn.execute(ins).mappings().one()
            trans.commit()
            print("Donor registered successfully")
            return {"message": "Donor registered successfully", "data": dict(row)}
    except Exception as e:
        return {"message": "Error registering donor", "error": str(e)}


def create_shelter(shelter: ShelterRegister):
    """
    Save shelter to database
    """
    try:
        with engine.connect() as conn:
            trans = conn.begin()
            
            ins = shelters_table.insert().values(
                id=uuid.uuid4(),
                uid=shelter.userID,
                username=shelter.username,
                shelter_name=shelter.shelter_name,
                email=shelter.email,
                phone_number=shelter.phone_number,
            ).returning(shelters_table.c.id, shelters_table.c.username, shelters_table.c.email)
            
            row = conn.execute(ins).mappings().one()
            trans.commit()
            print("Shelter registered successfully")
            return {"message": "Shelter registered successfully", "data": dict(row)}
    except Exception as e:
        return {"message": "Error registering shelter", "error": str(e)}