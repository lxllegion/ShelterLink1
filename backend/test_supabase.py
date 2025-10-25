from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, text
from sqlalchemy.dialects.postgresql import UUID
import uuid
# from sqlalchemy.pool import NullPool
# from dotenv import load_dotenv
import os

# Load environment variables from .env
# load_dotenv()

# Fetch variables
# USER = os.getenv("user")
# PASSWORD = os.getenv("password")
# HOST = os.getenv("host")
# PORT = os.getenv("port")
# DBNAME = os.getenv("dbname")

# Construct the SQLAlchemy connection string

# THIS DOES NOT FOR IPv4
# DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"

# THIS ONE WORKS
DATABASE_URL = f"postgresql://postgres.ukfpqtjwmutklagjssqp:uwcse403@aws-1-us-west-1.pooler.supabase.com:5432/postgres"

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)
# If using Transaction Pooler or Session Pooler, we want to ensure we disable SQLAlchemy client side pooling -
# https://docs.sqlalchemy.org/en/20/core/pooling.html#switching-pool-implementations
# engine = create_engine(DATABASE_URL, poolclass=NullPool)

# Test the connection
metadata = MetaData(schema="public")  # set schema if needed

donors = Table(
    "donors", metadata,
    Column("id", UUID(as_uuid=True), primary_key=True),
    Column("uid", String, unique=True),
    Column("username", String, unique=True),
    Column("email", String, unique=True),
)

with engine.connect() as conn:
    trans = conn.begin()

    ins = donors.insert().values(
        id=uuid.uuid4(),
        uid="test-donor-1",
        username="test-donor-1",
        email="test-donor-1@example.com",
    ).returning(donors.c.id, donors.c.username, donors.c.email)

    row = conn.execute(ins).mappings().one()
    trans.commit()
    print("Inserted:", dict(row))
