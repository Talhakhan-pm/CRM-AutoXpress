from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.db.database import get_db
from app.crud import get_callback, get_callbacks, create_callback, update_callback, delete_callback, search_callbacks
from app.schemas.callback import CallbackCreate, CallbackResponse, CallbackUpdate, CallbackFilterParams

router = APIRouter()


@router.get("/", response_model=List[CallbackResponse])
def read_callbacks(
    follow_up_date_start: Optional[date] = None,
    follow_up_date_end: Optional[date] = None,
    status: Optional[str] = None,
    agent_name: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieve all callbacks with optional filtering
    """
    filters = CallbackFilterParams(
        follow_up_date_start=follow_up_date_start,
        follow_up_date_end=follow_up_date_end,
        status=status,
        agent_name=agent_name
    )
    
    callbacks = get_callbacks(db, skip=skip, limit=limit, filters=filters)
    return callbacks


@router.post("/", response_model=CallbackResponse)
def create_new_callback(
    callback: CallbackCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new callback
    """
    return create_callback(db=db, callback=callback)


@router.get("/{callback_id}", response_model=CallbackResponse)
def read_callback(
    callback_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific callback by ID
    """
    db_callback = get_callback(db, callback_id=callback_id)
    if db_callback is None:
        raise HTTPException(status_code=404, detail="Callback not found")
    return db_callback


@router.put("/{callback_id}", response_model=CallbackResponse)
def update_existing_callback(
    callback_id: int,
    callback: CallbackUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a callback
    """
    db_callback = update_callback(db, callback_id=callback_id, callback=callback)
    if db_callback is None:
        raise HTTPException(status_code=404, detail="Callback not found")
    return db_callback


@router.delete("/{callback_id}", response_model=bool)
def delete_existing_callback(
    callback_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a callback
    """
    success = delete_callback(db, callback_id=callback_id)
    if not success:
        raise HTTPException(status_code=404, detail="Callback not found")
    return success


@router.get("/search/", response_model=List[CallbackResponse])
def search_for_callbacks(
    query: str = Query(..., min_length=3),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Search callbacks by customer name, car make/model, callback number or comments
    """
    callbacks = search_callbacks(db, search_term=query, skip=skip, limit=limit)
    return callbacks