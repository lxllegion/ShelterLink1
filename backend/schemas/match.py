from pydantic import BaseModel

class Match(BaseModel):
  id: str
  donor_id: str
  donor_username: str
  shelter_id: str
  shelter_name: str
  item_name: str
  quantity: int
  category: str
  matched_at: str
  status: str
