from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from datetime import date

from app.db.database import get_db
from app.crud import (
    get_callback, get_callbacks, create_callback, update_callback, delete_callback, search_callbacks,
    claim_callback, unclaim_callback, get_callback_as_dict,
    log_view_activity, log_edit_activity, log_status_change, log_claim_activity, log_unclaim_activity
)
from app.schemas.callback import CallbackCreate, CallbackResponse, CallbackUpdate, CallbackFilterParams, CallbackClaimRequest

router = APIRouter()


@router.get("/", response_model=List[CallbackResponse])
def read_callbacks(
    follow_up_date_start: Optional[date] = None,
    follow_up_date_end: Optional[date] = None,
    status: Optional[str] = None,
    agent_name: Optional[str] = None,
    claimed: Optional[bool] = None,
    claimed_by: Optional[str] = None,
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
        agent_name=agent_name,
        claimed=claimed,
        claimed_by=claimed_by
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
    user_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get a specific callback by ID
    """
    db_callback = get_callback(db, callback_id=callback_id)
    if db_callback is None:
        raise HTTPException(status_code=404, detail="Callback not found")
    
    # Log view activity if user_id is provided
    if user_id:
        log_view_activity(db=db, callback_id=callback_id, user_id=user_id)
    
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
    # Get the callback before update for activity logging
    db_callback_before = get_callback(db, callback_id=callback_id)
    if db_callback_before is None:
        raise HTTPException(status_code=404, detail="Callback not found")
    
    # Store previous values for activity logging
    previous_data = get_callback_as_dict(db, callback_id=callback_id)
    previous_status = db_callback_before.status
    
    # Update the callback
    db_callback = update_callback(db, callback_id=callback_id, callback=callback)
    if db_callback is None:
        raise HTTPException(status_code=404, detail="Callback not found")
    
    # Log status change if status changed
    if callback.status and callback.status != previous_status:
        log_status_change(
            db=db,
            callback_id=callback_id,
            user_id=callback.last_modified_by,
            previous_status=previous_status,
            new_status=callback.status
        )
    
    # Log edit activity
    if callback.last_modified_by:
        new_data = get_callback_as_dict(db, callback_id=callback_id)
        log_edit_activity(
            db=db,
            callback_id=callback_id,
            user_id=callback.last_modified_by,
            previous_data=previous_data,
            new_data=new_data
        )
    
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


@router.post("/{callback_id}/claim", response_model=CallbackResponse)
def claim_existing_callback(
    callback_id: int,
    claim_data: CallbackClaimRequest,
    db: Session = Depends(get_db)
):
    """
    Claim a callback for a user
    """
    # Check if callback exists
    db_callback = get_callback(db, callback_id=callback_id)
    if db_callback is None:
        raise HTTPException(status_code=404, detail="Callback not found")
    
    # Check if already claimed by another user
    if db_callback.claimed_by and db_callback.claimed_by != claim_data.user_id:
        raise HTTPException(
            status_code=400, 
            detail=f"Callback is already claimed by user {db_callback.claimed_by}"
        )
    
    # Claim the callback
    db_callback = claim_callback(db, callback_id=callback_id, claim_data=claim_data)
    
    # Log claim activity
    log_claim_activity(db=db, callback_id=callback_id, user_id=claim_data.user_id)
    
    return db_callback


@router.post("/{callback_id}/unclaim", response_model=CallbackResponse)
def unclaim_existing_callback(
    callback_id: int,
    claim_data: CallbackClaimRequest,
    db: Session = Depends(get_db)
):
    """
    Release a claimed callback
    """
    # Check if callback exists
    db_callback = get_callback(db, callback_id=callback_id)
    if db_callback is None:
        raise HTTPException(status_code=404, detail="Callback not found")
    
    # Check if claimed by the requesting user
    if db_callback.claimed_by != claim_data.user_id:
        raise HTTPException(
            status_code=400, 
            detail="You can only release callbacks that you have claimed"
        )
    
    # Unclaim the callback
    db_callback = unclaim_callback(db, callback_id=callback_id)
    
    # Log unclaim activity
    log_unclaim_activity(db=db, callback_id=callback_id, user_id=claim_data.user_id)
    
    return db_callback


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