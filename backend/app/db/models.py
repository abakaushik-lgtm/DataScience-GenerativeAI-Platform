from sqlalchemy import Column, Integer, String, DateTime, JSON
from app.db.session import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class SavedReport(Base):
    __tablename__ = "saved_reports"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    report_type = Column(String) # e.g. "Executive Summary"
    content_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
