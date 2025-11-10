"""
Migration script to add location fields to shelters table
Run this once to update your database schema
"""
from database import engine
from sqlalchemy import text

def add_location_columns():
    """Add location columns to shelters table"""
    try:
        with engine.connect() as conn:
            trans = conn.begin()

            # Check if columns already exist
            check_query = text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'shelters'
                AND column_name = 'address';
            """)
            result = conn.execute(check_query).first()

            if result:
                print("Location columns already exist. Skipping migration.")
                trans.rollback()
                return

            # Add new columns to shelters table
            alter_queries = [
                "ALTER TABLE shelters ADD COLUMN address VARCHAR;",
                "ALTER TABLE shelters ADD COLUMN city VARCHAR;",
                "ALTER TABLE shelters ADD COLUMN state VARCHAR;",
                "ALTER TABLE shelters ADD COLUMN zip_code VARCHAR;",
                "ALTER TABLE shelters ADD COLUMN latitude VARCHAR;",
                "ALTER TABLE shelters ADD COLUMN longitude VARCHAR;"
            ]

            for query in alter_queries:
                print(f"Executing: {query}")
                conn.execute(text(query))

            trans.commit()
            print("\n✅ Migration completed successfully!")
            print("Location columns added to shelters table:")
            print("  - address")
            print("  - city")
            print("  - state")
            print("  - zip_code")
            print("  - latitude")
            print("  - longitude")

    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        trans.rollback()
        raise

if __name__ == "__main__":
    print("Starting migration: Adding location fields to shelters table...")
    add_location_columns()
