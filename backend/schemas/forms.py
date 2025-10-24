from pydantic import BaseModel

# Donation Form
class DonationForm(BaseModel):
    donor_id: str
    item_name: str
    quantity: int
    category: str

# Req Form
class RequestForm(BaseModel):
    donor_id: str
    item_name: str
    quantity: int
    category: str