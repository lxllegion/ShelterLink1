
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def generate_embedding(category: str, item_name: str, quantity: int) -> list[float]:
  embedding_text = f"item_name: {item_name}, category: {category}, quantity: {quantity}"
  print("Generating embedding for: ", embedding_text)
  embedding = model.encode(embedding_text)
  print("---------------Finished Generating Embedding-----------------")
  return embedding.tolist()