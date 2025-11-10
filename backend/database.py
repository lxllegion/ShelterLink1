from sqlalchemy import create_engine, MetaData, Table, Column, String
from sqlalchemy.dialects.postgresql import UUID
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Use SQLite for testing if no DATABASE_URL is provided
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(DATABASE_URL)

is_sqlite = DATABASE_URL.startswith("sqlite")

if is_sqlite:
    id_type = String(36)
    metadata = MetaData()
else:
    id_type = UUID(as_uuid=True)
    metadata = MetaData(schema="public")

donors_table = Table(
    "donors", metadata,
    Column("id", id_type, primary_key=True),
    Column("uid", String, unique=True),
    Column("name", String),
    Column("username", String, unique=True),
    Column("email", String, unique=True),
    Column("phone_number", String),
)

shelters_table = Table(
    "shelters", metadata,
    Column("id", id_type, primary_key=True),
    Column("uid", String, unique=True),
    Column("shelter_name", String),
    Column("email", String, unique=True),
    Column("phone_number", String),
    Column("address", String),
    Column("city", String),
    Column("state", String),
    Column("zip_code", String),
    Column("latitude", String),
    Column("longitude", String),
)

# Create tables if using SQLite (for testing)
if is_sqlite:
    metadata.create_all(engine)
