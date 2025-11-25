from sqlalchemy import create_engine, MetaData, Table, Column, String, Integer, TIMESTAMP, func, ForeignKey, ARRAY, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from sqlalchemy.pool import NullPool
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print("DATABASE_URL:", os.getenv("DATABASE_URL"))

# Use SQLite for testing if no DATABASE_URL is provided
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///:memory:"

is_sqlite = DATABASE_URL.startswith("sqlite")

# Create engine with appropriate pooling settings
if is_sqlite:
    engine = create_engine(DATABASE_URL)
else:
    # For Supabase pooler, use NullPool to avoid connection pooling conflicts
    # Each request gets a fresh connection from Supabase's pooler
    engine = create_engine(
        DATABASE_URL,
        poolclass=NullPool,
        echo=False,
        connect_args={
            "connect_timeout": 10,
        }
    )

if is_sqlite:
    id_type = String(36)
    array_type = JSON  # SQLite doesn't support ARRAY, use JSON instead
    metadata = MetaData()
    uuid_array_type = String  # SQLite doesn't support arrays, use String
else:
    id_type = UUID(as_uuid=True)
    array_type = ARRAY(UUID(as_uuid=True))  # PostgreSQL supports ARRAY
    metadata = MetaData(schema="public")
    uuid_array_type = ARRAY(UUID(as_uuid=False))  # PostgreSQL UUID array

donors_table = Table(
    "donors", metadata,
    Column("id", id_type, primary_key=True),
    Column("uid", String, unique=True),
    Column("name", String),
    Column("username", String, unique=True),
    Column("email", String, unique=True),
    Column("phone_number", String),
    Column("match_ids", uuid_array_type, nullable=True),
    Column("donation_ids", uuid_array_type, nullable=True),
)

shelters_table = Table(
    "shelters", metadata,
    Column("id", id_type, primary_key=True),
    Column("uid", String, unique=True),
    Column("shelter_name", String),
    Column("email", String, unique=True),
    Column("phone_number", String),
    Column("match_ids", uuid_array_type, nullable=True),
    Column("request_ids", uuid_array_type, nullable=True),
    Column("address", String),
    Column("city", String),
    Column("state", String),
    Column("zip_code", String),
    Column("latitude", String),
    Column("longitude", String),
)

# Donations table
donations_table = Table(
    "donations", metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid()),
    Column("donor_id", String, nullable=False),  # Changed to String to accept string UUIDs
    Column("item_name", String, nullable=False),
    Column("quantity", Integer, nullable=False),
    Column("category", String, nullable=False),
    Column("created_at", TIMESTAMP(timezone=True), server_default=func.now()),
    Column("embedding", Vector(384))
)

# Requests table
requests_table = Table(
    "requests", metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid()),
    Column("shelter_id", String, nullable=False),  # Changed to String to accept string UUIDs
    Column("item_name", String, nullable=False),
    Column("quantity", Integer, nullable=False),
    Column("category", String, nullable=False),
    Column("created_at", TIMESTAMP(timezone=True), server_default=func.now()),
    Column("embedding", Vector(384))
)

# Matches table
matches_table = Table(
    "matches", metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid()),
    Column("donor_id", String, nullable=False),
    Column("donation_id", String, nullable=False),
    Column("donor_username", String, nullable=False),
    Column("shelter_id", String, nullable=False),
    Column("request_id", String, nullable=False),
    Column("shelter_name", String, nullable=False),
    Column("item_name", String, nullable=False),
    Column("quantity", Integer, nullable=False),
    Column("category", String, nullable=False),
    Column("matched_at", TIMESTAMP(timezone=True), server_default=func.now()),
    Column("status", String, nullable=False),
)

# Create tables if using SQLite (for testing)
if is_sqlite:
    metadata.create_all(engine)
