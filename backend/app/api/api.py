from fastapi import APIRouter
from app.api.endpoints import callbacks

api_router = APIRouter()
api_router.include_router(callbacks.router, prefix="/callbacks", tags=["callbacks"])