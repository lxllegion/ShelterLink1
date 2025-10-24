from pydantic import BaseModel, EmailStr

class DonorRegister(BaseModel):
    userID: str
    username: str
    email: EmailStr
    phone_number: str