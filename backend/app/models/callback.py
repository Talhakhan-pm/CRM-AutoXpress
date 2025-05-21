from sqlalchemy import Column, Integer, String, Text, Date, Float, ForeignKey, func, text
from sqlalchemy.orm import relationship
from app.db.database import Base, get_current_time, TZDateTime
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.sql.expression import FunctionElement
from datetime import datetime, timezone
import pytz
from app.core.config import settings


# Custom function to use timezone-aware now() function
class TimestampFunction(FunctionElement):
    name = 'now_tz'
    inherit_cache = True

@compiles(TimestampFunction, 'sqlite')
def sqlite_timestamp(element, compiler, **kw):
    """SQLite implementation of timezone-aware timestamp"""
    return "CURRENT_TIMESTAMP"

# Use this instead of func.now() for timezone-aware timestamps
now_tz = TimestampFunction()


class Callback(Base):
    """
    SQLAlchemy model for Callbacks table
    """
    __tablename__ = "callbacks"

    id = Column(Integer, primary_key=True, index=True)
    product = Column(String(255), nullable=True)
    vehicle_year = Column(Integer, nullable=True)
    car_make = Column(String(100), nullable=True)
    car_model = Column(String(100), nullable=True)
    zip_code = Column(String(10), nullable=True)
    customer_name = Column(String(255), nullable=False)
    callback_number = Column(String(20), nullable=False, index=True)
    follow_up_date = Column(Date, nullable=True)
    status = Column(String(50), default="Pending")  # Pending, Sale, No Answer, Follow-up Later
    agent_name = Column(String(100), nullable=True)
    lead_score = Column(Float, nullable=True)
    comments = Column(Text, nullable=True)
    # Use our custom TZDateTime type to ensure proper timezone handling
    created_at = Column(TZDateTime, server_default=text("CURRENT_TIMESTAMP"))
    last_modified = Column(TZDateTime, server_default=text("CURRENT_TIMESTAMP"), 
                           onupdate=datetime.now(tz=settings.TIMEZONE_OBJ))
    last_modified_by = Column(String(100), nullable=True)
    
    # Claim functionality
    claimed_by = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    claimed_at = Column(TZDateTime, nullable=True)
    
    # Relationships
    activities = relationship("CallbackActivity", back_populates="callback", cascade="all, delete")
    claimed_user = relationship("User", foreign_keys=[claimed_by], backref="claimed_callbacks")