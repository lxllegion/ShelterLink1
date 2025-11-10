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