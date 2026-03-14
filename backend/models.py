from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False)
    age        = Column(Integer)
    language   = Column(String(10), default="english")
    avatar     = Column(String(50), default="doraemon")
    created_at = Column(DateTime, default=datetime.utcnow)

    sessions  = relationship("Session", back_populates="user")
    progress  = relationship("Progress", back_populates="user")

class Session(Base):
    __tablename__ = "sessions"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    topic      = Column(String(200))
    started_at = Column(DateTime, default=datetime.utcnow)

    user          = relationship("User", back_populates="sessions")
    conversations = relationship("Conversation", back_populates="session")

class Progress(Base):
    __tablename__ = "progress"
    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), unique=True)
    points      = Column(Integer, default=0)
    level       = Column(Integer, default=1)
    badges_json = Column(Text, default="[]")

    user = relationship("User", back_populates="progress")

class Conversation(Base):
    __tablename__ = "conversations"
    id         = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    role       = Column(String(20))   # "user" or "assistant"
    message    = Column(Text)
    voice_char = Column(String(50), default="doraemon")
    timestamp  = Column(DateTime, default=datetime.utcnow)

    session = relationship("Session", back_populates="conversations")
class ParentSettings(Base):
    __tablename__ = "parent_settings"
    id                = Column(Integer, primary_key=True, index=True)
    user_id           = Column(Integer, ForeignKey("users.id"), unique=True)
    max_daily_minutes = Column(Integer, default=60)
    blocked_topics    = Column(Text, default="[]")
    password_hash     = Column(String(200))

    user = relationship("User")