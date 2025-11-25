from uuid import UUID
from pydantic import BaseModel

# Donation Form
class DonationForm(BaseModel):
    donor_id: str  # Keep as string for flexibility
    item_name: str
    quantity: int
    category: str

# Req Form
class RequestForm(BaseModel):
    shelter_id: str  # Keep as string for flexibility
    item_name: str
    quantity: int
    category: str


class DonationRead(BaseModel):
    id: UUID
    donor_id: str
    item_name: str
    quantity: int
    category: str

class RequestRead(BaseModel):
    id: UUID
    shelter_id: str
    item_name: str
    quantity: int
    category: str


class DonorForm(BaseModel):
    uid: str
    name: str
    username: str
    phone_number: str