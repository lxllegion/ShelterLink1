from pydantic import BaseModel, EmailStr

class ShelterRegister(BaseModel):
    userID: str
    username: str
    shelter_name: str
    email: EmailStr
    phone_number: str