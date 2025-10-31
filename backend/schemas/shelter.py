from pydantic import BaseModel, EmailStr

class Shelter(BaseModel):
    userID: str
    username: str
    shelter_name: str
    email: EmailStr
    phone_number: str