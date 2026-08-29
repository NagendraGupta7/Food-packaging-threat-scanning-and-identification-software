import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# In production (Render/Neon/etc), set DATABASE_URL as an environment variable
# to a real Postgres connection string. Falls back to a local SQLite file for
# local development, so nothing extra is needed to just run this on your machine.
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./legal_metrology.db")

# Some providers (Render, Heroku-style) hand out "postgres://" URLs, but
# SQLAlchemy's psycopg2 driver expects "postgresql://" — normalize it.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
