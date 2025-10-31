from pydantic import BaseModel, EmailStr

class Donor(BaseModel):
    userID: str
    name: str
    username: str
    email: EmailStr
    phone_number: str