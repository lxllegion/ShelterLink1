from pydantic import BaseModel
from typing import Optional

# Donation Form
class DonationForm(BaseModel):
    donor_id: str
    item_name: str
    quantity: int
    category: str
    created_at: str

# Req Form
class RequestForm(BaseModel):
    id: str
    shelter_id: str 
    item_name: str
    quantity: int
    category: str
    item_description: Optional[str] = None
    created_at: str

class Config:
    from_attributes = True