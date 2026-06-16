from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Use environment variables, fallback to local docker defaults
POSTGRES_USER = os.getenv("POSTGRES_USER", "antigravity")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "antigravity_password")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "antigravity_db")

SQLALCHEMY_DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

use_sqlite = False
try:
    # Use a short connect timeout so we don't hang if Postgres is down
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"connect_timeout": 2})
    # Force a connection check to verify if Postgres is actually up
    with engine.connect() as conn:
        pass
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    use_sqlite = True

if use_sqlite:
    # Fallback to local SQLite if Postgres isn't running
    engine = create_engine("sqlite:///./antigravity_fallback.db", connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
