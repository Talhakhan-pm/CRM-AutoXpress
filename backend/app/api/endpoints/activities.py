from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.crud import (
    get_callback,
    get_activities_by_callback,
    log_view_activity,
    create_activity,
)
from app.schemas.callback_activity import (
    CallbackActivityCreate,
    CallbackActivityResponse,
    ACTIVITY_TYPES,
)
from app.models.callback_activity import CallbackActivity
from app.models.user import User

router = APIRouter()


@router.get("/{callback_id}", response_model=List[CallbackActivityResponse])
def read_callback_activities(
    callback_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all activities for a callback
    """
    # Check if callback exists
    db_callback = get_callback(db, callback_id=callback_id)
    if db_callback is None:
        raise HTTPException(status_code=404, detail="Callback not found")
    
    # Get activities with user relationship loaded (for username)
    activities = db.query(CallbackActivity)\
        .filter(CallbackActivity.callback_id == callback_id)\
        .order_by(CallbackActivity.created_at.desc())\
        .options(joinedload(CallbackActivity.user))\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return activities


@router.post("/{callback_id}/view", response_model=CallbackActivityResponse)
def record_view_activity(
    callback_id: int,
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Record a view activity for a callback
    """
    # Check if callback exists
    db_callback = get_callback(db, callback_id=callback_id)
    if db_callback is None:
        raise HTTPException(status_code=404, detail="Callback not found")
    
    # Log view activity
    activity = log_view_activity(
        db=db,
        callback_id=callback_id,
        user_id=user_id
    )
    
    # Reload the activity with user data
    return db.query(CallbackActivity)\
        .filter(CallbackActivity.id == activity.id)\
        .options(joinedload(CallbackActivity.user))\
        .first()


@router.post("/{callback_id}", response_model=CallbackActivityResponse)
def create_callback_activity(
    callback_id: int,
    activity: CallbackActivityCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new activity for a callback
    """
    # Check if callback exists
    db_callback = get_callback(db, callback_id=callback_id)
    if db_callback is None:
        raise HTTPException(status_code=404, detail="Callback not found")
    
    # Validate activity type
    if activity.activity_type not in ACTIVITY_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid activity type. Must be one of: {', '.join(ACTIVITY_TYPES)}"
        )
    
    # Set the callback_id from the path
    activity_data = activity.model_dump()
    activity_data["callback_id"] = callback_id
    
    # Create activity
    created_activity = create_activity(db=db, activity=CallbackActivityCreate(**activity_data))
    
    # Reload the activity with user data
    return db.query(CallbackActivity)\
        .filter(CallbackActivity.id == created_activity.id)\
        .options(joinedload(CallbackActivity.user))\
        .first()