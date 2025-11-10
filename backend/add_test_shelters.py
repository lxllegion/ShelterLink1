"""
Script to add test shelters with location data
"""
from database import engine, shelters_table
import uuid

def add_test_shelters():
    """Add test shelters with location information"""

    test_shelters = [
        {
            "id": str(uuid.uuid4()),
            "uid": "TEST_S00001",
            "shelter_name": "Seattle Downtown Shelter",
            "email": "contact@seattleshelter.org",
            "phone_number": "555-123-4567",
            "address": "1902 2nd Ave",
            "city": "Seattle",
            "state": "WA",
            "zip_code": "98101",
            "latitude": "47.6097",
            "longitude": "-122.3331"
        },
        {
            "id": str(uuid.uuid4()),
            "uid": "TEST_S00002",
            "shelter_name": "Tacoma Care Center",
            "email": "info@tacomacenter.org",
            "phone_number": "555-987-6543",
            "address": "1501 Pacific Ave",
            "city": "Tacoma",
            "state": "WA",
            "zip_code": "98402",
            "latitude": "47.2529",
            "longitude": "-122.4443"
        },
        {
            "id": str(uuid.uuid4()),
            "uid": "TEST_S00003",
            "shelter_name": "Bellevue Hope Center",
            "email": "help@bellevuehope.org",
            "phone_number": "555-222-3333",
            "address": "1116 108th Ave NE",
            "city": "Bellevue",
            "state": "WA",
            "zip_code": "98004",
            "latitude": "47.6149",
            "longitude": "-122.1938"
        },
        {
            "id": str(uuid.uuid4()),
            "uid": "TEST_S00004",
            "shelter_name": "Everett Family Services",
            "email": "contact@everettfs.org",
            "phone_number": "555-444-5555",
            "address": "2727 Colby Ave",
            "city": "Everett",
            "state": "WA",
            "zip_code": "98201",
            "latitude": "47.9790",
            "longitude": "-122.2021"
        },
        {
            "id": str(uuid.uuid4()),
            "uid": "TEST_S00005",
            "shelter_name": "Redmond Community Shelter",
            "email": "info@redmondshelter.org",
            "phone_number": "555-333-6666",
            "address": "8703 160th Ave NE",
            "city": "Redmond",
            "state": "WA",
            "zip_code": "98052",
            "latitude": "47.6740",
            "longitude": "-122.1215"
        }
    ]

    try:
        with engine.connect() as conn:
            trans = conn.begin()

            for shelter in test_shelters:
                # Check if shelter already exists (by email)
                from sqlalchemy import text
                check = text("SELECT id FROM shelters WHERE email = :email")
                result = conn.execute(check, {"email": shelter["email"]}).first()

                if result:
                    print(f"⚠️  Shelter with email {shelter['email']} already exists. Skipping.")
                    continue

                conn.execute(shelters_table.insert().values(**shelter))
                print(f"✅ Added: {shelter['shelter_name']}")

            trans.commit()
            print("\n🎉 Test shelters added successfully!")
            print(f"Added {len(test_shelters)} shelters with location data.")

    except Exception as e:
        print(f"❌ Error adding shelters: {str(e)}")
        trans.rollback()
        raise

if __name__ == "__main__":
    print("Adding test shelters with location data...\n")
    add_test_shelters()
