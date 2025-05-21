from pydantic import BaseModel, Field, model_validator, root_validator
from typing import Optional, Dict, Any, List
from datetime import date, datetime, timezone
import pytz
from app.core.config import settings


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
    claimed_by: Optional[str] = None
    claimed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        
    # Convert UTC datetime to Pacific timezone
    @model_validator(mode='after')
    def convert_timezone(self) -> 'CallbackInDB':
        if hasattr(self, 'created_at') and self.created_at:
            if self.created_at.tzinfo is None:
                # Add UTC timezone if no timezone information
                self.created_at = self.created_at.replace(tzinfo=timezone.utc)
            # Convert to Pacific time
            self.created_at = self.created_at.astimezone(settings.TIMEZONE_OBJ)
            
        if hasattr(self, 'last_modified') and self.last_modified:
            if self.last_modified.tzinfo is None:
                # Add UTC timezone if no timezone information
                self.last_modified = self.last_modified.replace(tzinfo=timezone.utc)
            # Convert to Pacific time
            self.last_modified = self.last_modified.astimezone(settings.TIMEZONE_OBJ)
            
        if hasattr(self, 'claimed_at') and self.claimed_at:
            if self.claimed_at.tzinfo is None:
                # Add UTC timezone if no timezone information
                self.claimed_at = self.claimed_at.replace(tzinfo=timezone.utc)
            # Convert to Pacific time
            self.claimed_at = self.claimed_at.astimezone(settings.TIMEZONE_OBJ)
            
        return self


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
    claimed: Optional[bool] = None
    claimed_by: Optional[str] = None


class CallbackClaimRequest(BaseModel):
    """
    Schema for claiming/unclaiming a callback
    """
    user_id: str