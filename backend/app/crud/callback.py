from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import date

from app.models.callback import Callback
from app.schemas.callback import CallbackCreate, CallbackUpdate, CallbackFilterParams


def get_callback(db: Session, callback_id: int) -> Optional[Callback]:
    """
    Get a callback by ID
    """
    return db.query(Callback).filter(Callback.id == callback_id).first()


def get_callbacks(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    filters: Optional[CallbackFilterParams] = None
) -> List[Callback]:
    """
    Get all callbacks with optional filtering
    """
    query = db.query(Callback)
    
    if filters:
        # Apply filters if provided
        if filters.follow_up_date_start:
            query = query.filter(Callback.follow_up_date >= filters.follow_up_date_start)
        
        if filters.follow_up_date_end:
            query = query.filter(Callback.follow_up_date <= filters.follow_up_date_end)
        
        if filters.status:
            query = query.filter(Callback.status == filters.status)
        
        if filters.agent_name:
            query = query.filter(Callback.agent_name == filters.agent_name)
    
    # Order by follow-up date (most recent first) and then by last modified date
    return query.order_by(Callback.follow_up_date.desc(), Callback.last_modified.desc()).offset(skip).limit(limit).all()


def create_callback(db: Session, callback: CallbackCreate) -> Callback:
    """
    Create a new callback
    """
    db_callback = Callback(**callback.model_dump())
    db.add(db_callback)
    db.commit()
    db.refresh(db_callback)
    return db_callback


def update_callback(db: Session, callback_id: int, callback: CallbackUpdate) -> Optional[Callback]:
    """
    Update an existing callback
    """
    db_callback = get_callback(db, callback_id)
    if not db_callback:
        return None
    
    # Update callback with provided fields, skipping None values
    update_data = callback.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_callback, key, value)
    
    db.commit()
    db.refresh(db_callback)
    return db_callback


def delete_callback(db: Session, callback_id: int) -> bool:
    """
    Delete a callback
    """
    db_callback = get_callback(db, callback_id)
    if not db_callback:
        return False
    
    db.delete(db_callback)
    db.commit()
    return True


def search_callbacks(db: Session, search_term: str, skip: int = 0, limit: int = 100) -> List[Callback]:
    """
    Search callbacks by customer name, car make/model, or callback number
    """
    search_pattern = f"%{search_term}%"
    return db.query(Callback).filter(
        or_(
            Callback.customer_name.ilike(search_pattern),
            Callback.car_make.ilike(search_pattern),
            Callback.car_model.ilike(search_pattern),
            Callback.callback_number.ilike(search_pattern),
            Callback.comments.ilike(search_pattern)
        )
    ).order_by(Callback.follow_up_date.desc()).offset(skip).limit(limit).all()