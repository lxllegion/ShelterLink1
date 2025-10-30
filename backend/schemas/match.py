from pydantic import BaseModel

class Match(BaseModel):
  id: str
  donor_id: str
  shelter_id: str
  item_name: str
  quantity: int
  category: str
  matched_at: str
  status: str
