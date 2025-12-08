from pydantic import BaseModel
from typing import Optional

# Donation Form
class DonationForm(BaseModel):
    donor_id: str  # Keep as string for flexibility
    item_name: str
    quantity: int
    category: str

# Request Form
class RequestForm(BaseModel):
    shelter_id: str  # Keep as string for flexibility
    item_name: str
    quantity: int
    category: str

# Donor Update Models
class DonorUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    phone_number: Optional[str] = None

# Shelter Update Model
class ShelterUpdate(BaseModel):
    shelter_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None