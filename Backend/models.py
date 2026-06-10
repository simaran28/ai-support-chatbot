from sqlalchemy import Column, String, Text, Integer, Enum, DateTime
from sqlalchemy.sql import func
from database import Base

class Session(Base):
    __tablename__ = "sessions"

    id         = Column(String(100), primary_key=True)
    user_name  = Column(String(100), default="Guest")
    title      = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class Message(Base):
    __tablename__ = "messages"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(100), nullable=False)
    role       = Column(Enum("user", "assistant"), nullable=False)
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

class Document(Base):
    __tablename__ = "documents"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    filename    = Column(String(255), nullable=False)
    file_path   = Column(String(500), nullable=False)
    chunk_count = Column(Integer, default=0)
    uploaded_at = Column(DateTime, server_default=func.now())