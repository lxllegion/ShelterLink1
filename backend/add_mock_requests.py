import sys
from database import engine, requests_table
from sqlalchemy import insert
from services.embeddings import generate_embedding

# Mock request data for shelters
mock_requests = [
    # Seattle Shelter (S00001)
    {
        "shelter_id": "S00001",
        "item_name": "Winter Coats",
        "quantity": 50,
        "category": "Clothing"
    },
    {
        "shelter_id": "S00001",
        "item_name": "Canned Food",
        "quantity": 100,
        "category": "Food"
    },
    {
        "shelter_id": "S00001",
        "item_name": "Blankets",
        "quantity": 30,
        "category": "Bedding"
    },
    {
        "shelter_id": "S00001",
        "item_name": "Toiletries",
        "quantity": 75,
        "category": "Hygiene"
    },

    # Tacoma Care Center (S00002)
    {
        "shelter_id": "S00002",
        "item_name": "Sleeping Bags",
        "quantity": 25,
        "category": "Bedding"
    },
    {
        "shelter_id": "S00002",
        "item_name": "Rice",
        "quantity": 60,
        "category": "Food"
    },
    {
        "shelter_id": "S00002",
        "item_name": "Shoes",
        "quantity": 40,
        "category": "Clothing"
    },

    # Bellevue Hope Center (S00003)
    {
        "shelter_id": "S00003",
        "item_name": "Baby Formula",
        "quantity": 20,
        "category": "Food"
    },
    {
        "shelter_id": "S00003",
        "item_name": "Diapers",
        "quantity": 100,
        "category": "Hygiene"
    },
    {
        "shelter_id": "S00003",
        "item_name": "Children's Clothes",
        "quantity": 35,
        "category": "Clothing"
    },
    {
        "shelter_id": "S00003",
        "item_name": "Pasta",
        "quantity": 50,
        "category": "Food"
    },
    {
        "shelter_id": "S00003",
        "item_name": "Towels",
        "quantity": 40,
        "category": "Bedding"
    },

    # Everett Family Services (S00004)
    {
        "shelter_id": "S00004",
        "item_name": "Backpacks",
        "quantity": 30,
        "category": "Supplies"
    },
    {
        "shelter_id": "S00004",
        "item_name": "Socks",
        "quantity": 80,
        "category": "Clothing"
    },
    {
        "shelter_id": "S00004",
        "item_name": "Bottled Water",
        "quantity": 200,
        "category": "Food"
    },
    {
        "shelter_id": "S00004",
        "item_name": "First Aid Kits",
        "quantity": 15,
        "category": "Medical"
    }
]

def add_mock_requests():
    """Add mock request data to the database"""
    try:
        with engine.connect() as conn:
            for request in mock_requests:
                # Generate embedding for the request
                embedding = generate_embedding(
                    request["category"],
                    request["item_name"],
                    request["quantity"]
                )

                # Insert the request
                conn.execute(insert(requests_table).values(
                    shelter_id=request["shelter_id"],
                    item_name=request["item_name"],
                    quantity=request["quantity"],
                    category=request["category"],
                    embedding=embedding
                ))
                print(f"Added request: {request['item_name']} for shelter {request['shelter_id']}")

            conn.commit()
            print(f"\nSuccessfully added {len(mock_requests)} mock requests to the database!")

    except Exception as e:
        print(f"Error adding mock requests: {e}")
        sys.exit(1)

if __name__ == "__main__":
    add_mock_requests()
