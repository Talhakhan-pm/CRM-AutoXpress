from sqlalchemy import Column, Integer, String, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.db.database import Base, TZDateTime
from datetime import datetime
from app.core.config import settings

class CallbackActivity(Base):
    """
    SQLAlchemy model for callback activities
    Tracks all actions performed on callbacks including:
    - Views
    - Status changes
    - Claims
    - Comments
    - Edits
    """
    __tablename__ = "callback_activities"

    id = Column(Integer, primary_key=True, index=True)
    callback_id = Column(Integer, ForeignKey("callbacks.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    activity_type = Column(String(50), nullable=False)  # view, edit, claim, comment, status_change
    description = Column(Text, nullable=True)
    created_at = Column(TZDateTime, default=lambda: datetime.now(tz=settings.TIMEZONE_OBJ))
    
    # Previous and new values for tracking changes (stored as JSON strings)
    previous_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    
    # Relationships
    callback = relationship("Callback", back_populates="activities")
    user = relationship("User", back_populates="activities")