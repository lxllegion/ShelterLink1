from pydantic import BaseModel, EmailStr
from typing import Optional

class Shelter(BaseModel):
    userID: str
    username: str
    shelter_name: str
    email: EmailStr
    phone_number: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None