from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json

from app.models.callback_activity import CallbackActivity
from app.schemas.callback_activity import CallbackActivityCreate, ACTIVITY_TYPES

def create_activity(db: Session, *, activity: CallbackActivityCreate) -> CallbackActivity:
    """
    Create a new callback activity
    """
    # Validate activity type
    if activity.activity_type not in ACTIVITY_TYPES:
        raise ValueError(f"Invalid activity type: {activity.activity_type}")
    
    db_activity = CallbackActivity(
        callback_id=activity.callback_id,
        user_id=activity.user_id,
        activity_type=activity.activity_type,
        description=activity.description,
        previous_value=activity.previous_value,
        new_value=activity.new_value
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

def get_activities_by_callback(
    db: Session, *, callback_id: int, skip: int = 0, limit: int = 100
) -> List[CallbackActivity]:
    """
    Get all activities for a specific callback
    """
    return db.query(CallbackActivity).filter(
        CallbackActivity.callback_id == callback_id
    ).order_by(CallbackActivity.created_at.desc()).offset(skip).limit(limit).all()

def log_activity(
    db: Session, 
    *,
    callback_id: int,
    user_id: Optional[str],
    activity_type: str,
    description: str,
    previous_value: Optional[dict] = None,
    new_value: Optional[dict] = None
) -> CallbackActivity:
    """
    Helper function to log an activity with serialized values
    """
    # Convert dict values to JSON strings
    prev_value_str = None
    if previous_value:
        prev_value_str = json.dumps(previous_value)
        
    new_value_str = None
    if new_value:
        new_value_str = json.dumps(new_value)
    
    activity = CallbackActivityCreate(
        callback_id=callback_id,
        user_id=user_id,
        activity_type=activity_type,
        description=description,
        previous_value=prev_value_str,
        new_value=new_value_str
    )
    
    return create_activity(db=db, activity=activity)

def log_view_activity(db: Session, *, callback_id: int, user_id: str) -> CallbackActivity:
    """
    Log a view activity
    """
    return log_activity(
        db=db,
        callback_id=callback_id,
        user_id=user_id,
        activity_type="view",
        description="Viewed callback details"
    )

def log_edit_activity(
    db: Session, 
    *, 
    callback_id: int, 
    user_id: str,
    previous_data: dict,
    new_data: dict
) -> CallbackActivity:
    """
    Log an edit activity with changes
    """
    # Determine what actually changed
    changes = []
    for key, new_value in new_data.items():
        if key in previous_data and previous_data[key] != new_value:
            changes.append(f"{key}: {previous_data[key]} → {new_value}")
    
    if not changes:
        return None
    
    description = f"Updated {len(changes)} fields: " + ", ".join(changes[:3])
    if len(changes) > 3:
        description += f"... and {len(changes) - 3} more"
        
    return log_activity(
        db=db,
        callback_id=callback_id,
        user_id=user_id,
        activity_type="edit",
        description=description,
        previous_value=previous_data,
        new_value=new_data
    )

def log_status_change(
    db: Session, 
    *, 
    callback_id: int, 
    user_id: str,
    previous_status: str,
    new_status: str
) -> CallbackActivity:
    """
    Log a status change activity
    """
    return log_activity(
        db=db,
        callback_id=callback_id,
        user_id=user_id,
        activity_type="status_change",
        description=f"Changed status from \"{previous_status}\" to \"{new_status}\"",
        previous_value={"status": previous_status},
        new_value={"status": new_status}
    )

def log_claim_activity(
    db: Session, 
    *, 
    callback_id: int, 
    user_id: str
) -> CallbackActivity:
    """
    Log a callback claim activity
    """
    return log_activity(
        db=db,
        callback_id=callback_id,
        user_id=user_id,
        activity_type="claim",
        description=f"Claimed this callback"
    )

def log_unclaim_activity(
    db: Session, 
    *, 
    callback_id: int, 
    user_id: str
) -> CallbackActivity:
    """
    Log a callback unclaim activity
    """
    return log_activity(
        db=db,
        callback_id=callback_id,
        user_id=user_id,
        activity_type="unclaim",
        description=f"Released this callback"
    )