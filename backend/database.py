from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, MetaData
import os

DATABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")

engine = create_engine(DATABASE_URL)

metadata = MetaData(schema="public")
