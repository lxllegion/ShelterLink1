from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

DATAABASE_URL = NEXT_PUBLIC_SUPABASE_URL

engine = create_engine(DATABASE_URL)

Base = declarative_base()

