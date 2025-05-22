from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class CallbackActivityBase(BaseModel):
    """
    Base CallbackActivity schema with shared attributes
    """
    callback_id: int
    activity_type: str
    description: Optional[str] = None
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    user_id: Optional[str] = None

class CallbackActivityCreate(CallbackActivityBase):
    """
    Schema for creating a new activity
    """
    pass

class CallbackActivityInDB(CallbackActivityBase):
    """
    Schema for an activity retrieved from the database
    """
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserInfo(BaseModel):
    """
    Simplified user information for inclusion in activity responses
    """
    id: str
    username: str
    
    class Config:
        from_attributes = True

class CallbackActivityResponse(CallbackActivityInDB):
    """
    Schema for activity response object
    """
    user: Optional[UserInfo] = None
    
    class Config:
        from_attributes = True

# Activity types for validation
ACTIVITY_TYPES = [
    "view",
    "edit",
    "status_change",
    "claim",
    "unclaim",
    "comment"
]