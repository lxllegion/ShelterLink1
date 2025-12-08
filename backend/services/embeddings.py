from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def generate_embedding(category: str, item_name: str, quantity: int) -> list[float]:
    """
    Generate a vector embedding for an item.

    - Combines item name and category into a single string
    - Uses a sentence transformer model to create the embedding
    - Returns the embedding as a list of floats
    """
    embedding_text = f"{item_name},{category}"
    print("Generating embedding for: ", embedding_text)
    embedding = model.encode(embedding_text)
    print("---------------Finished Generating Embedding-----------------")
    return embedding.tolist()