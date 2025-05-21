from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class CallbackBase(BaseModel):
    """
    Base Callback schema with shared attributes
    """
    product: Optional[str] = None
    vehicle_year: Optional[int] = None
    car_make: Optional[str] = None
    car_model: Optional[str] = None
    zip_code: Optional[str] = None
    customer_name: str
    callback_number: str
    follow_up_date: Optional[date] = None
    status: str = "Pending"
    agent_name: Optional[str] = None
    lead_score: Optional[float] = None
    comments: Optional[str] = None


class CallbackCreate(CallbackBase):
    """
    Schema for creating a new callback
    """
    last_modified_by: Optional[str] = None


class CallbackUpdate(BaseModel):
    """
    Schema for updating an existing callback
    All fields are optional
    """
    product: Optional[str] = None
    vehicle_year: Optional[int] = None
    car_make: Optional[str] = None
    car_model: Optional[str] = None
    zip_code: Optional[str] = None
    customer_name: Optional[str] = None
    callback_number: Optional[str] = None
    follow_up_date: Optional[date] = None
    status: Optional[str] = None
    agent_name: Optional[str] = None
    lead_score: Optional[float] = None
    comments: Optional[str] = None
    last_modified_by: Optional[str] = None


class CallbackInDB(CallbackBase):
    """
    Schema for a callback retrieved from the database
    """
    id: int
    created_at: datetime
    last_modified: datetime
    last_modified_by: Optional[str] = None

    class Config:
        from_attributes = True


class CallbackResponse(CallbackInDB):
    """
    Schema for callback response object
    """
    pass


class CallbackFilterParams(BaseModel):
    """
    Query parameters for filtering callbacks
    """
    follow_up_date_start: Optional[date] = None
    follow_up_date_end: Optional[date] = None
    status: Optional[str] = None
    agent_name: Optional[str] = None