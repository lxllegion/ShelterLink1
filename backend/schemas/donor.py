from pydantic import BaseModel, EmailStr

# Donor data model
class Donor(BaseModel):
    userID: str
    name: str
    username: str
    email: EmailStr
    phone_number: str