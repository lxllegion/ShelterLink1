import uuid
from schemas.donor import Donor
from schemas.shelter import Shelter
from database import engine, donors_table, shelters_table

def create_donor(donor: Donor):
    """
    Save donor to database
    """
    try:
        with engine.connect() as conn:
            trans = conn.begin()
            
            # Check if username already exists in donors table
            username_check = donors_table.select().where(donors_table.c.username == donor.username)
            existing_username = conn.execute(username_check).first()
            if existing_username:
                trans.rollback()
                return {"message": "Error registering donor", "error": "Username already exists"}
            
            # Check if email already exists in donors table
            email_check = donors_table.select().where(donors_table.c.email == donor.email)
            existing_email = conn.execute(email_check).first()
            if existing_email:
                trans.rollback()
                return {"message": "Error registering donor", "error": "Email already exists"}
            
            ins = donors_table.insert().values(
                id=uuid.uuid4(),
                uid=donor.userID,
                name=donor.name,
                username=donor.username,
                email=donor.email,
                phone_number=donor.phone_number,
            ).returning(donors_table.c.id, donors_table.c.name, donors_table.c.username, donors_table.c.email, donors_table.c.phone_number)
            
            row = conn.execute(ins).mappings().one()
            trans.commit()
            print("Donor registered successfully")
            return {"message": "Donor registered successfully", "data": dict(row)}
    except Exception as e:
        return {"message": "Error registering donor", "error": str(e)}


def create_shelter(shelter: Shelter):
    """
    Save shelter to database
    """
    try:
        with engine.connect() as conn:
            trans = conn.begin()
            
            # Check if shelter_name already exists in shelters table
            shelter_name_check = shelters_table.select().where(shelters_table.c.shelter_name == shelter.shelter_name)
            existing_shelter = conn.execute(shelter_name_check).first()
            if existing_shelter:
                trans.rollback()
                return {"message": "Error registering shelter", "error": "Shelter name already exists"}
            
            # Check if email already exists in shelters table
            email_check = shelters_table.select().where(shelters_table.c.email == shelter.email)
            existing_email = conn.execute(email_check).first()
            if existing_email:
                trans.rollback()
                return {"message": "Error registering shelter", "error": "Email already exists"}
            
            ins = shelters_table.insert().values(
                id=uuid.uuid4(),
                uid=shelter.userID,
                username=shelter.username,
                shelter_name=shelter.shelter_name,
                email=shelter.email,
                phone_number=shelter.phone_number,
            ).returning(shelters_table.c.id, shelters_table.c.shelter_name, shelters_table.c.username, shelters_table.c.email, shelters_table.c.phone_number)
            
            row = conn.execute(ins).mappings().one()
            trans.commit()
            print("Shelter registered successfully")
            return {"message": "Shelter registered successfully", "data": dict(row)}
    except Exception as e:
        return {"message": "Error registering shelter", "error": str(e)}