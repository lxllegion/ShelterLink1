from sqlalchemy import create_engine, MetaData, Table, Column, String
from sqlalchemy.dialects.postgresql import UUID
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

metadata = MetaData(schema="public")

donors_table = Table(
    "donors", metadata,
    Column("id", UUID(as_uuid=True), primary_key=True),
    Column("uid", String, unique=True),
    Column("name", String),
    Column("username", String, unique=True),
    Column("email", String, unique=True),
    Column("phone_number", String),
)

shelters_table = Table(
    "shelters", metadata,
    Column("id", UUID(as_uuid=True), primary_key=True),
    Column("uid", String, unique=True),
    Column("username", String, unique=True),
    Column("shelter_name", String),
    Column("email", String, unique=True),
    Column("phone_number", String),
)
