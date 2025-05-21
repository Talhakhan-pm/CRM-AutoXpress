from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from app.db.database import Base


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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_modified = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_modified_by = Column(String(100), nullable=True)