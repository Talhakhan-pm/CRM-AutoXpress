from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from app.core.config import settings
import pytz
import datetime
from datetime import timezone
from sqlalchemy import TypeDecorator, DateTime

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./autoxpress_crm.db")

# Define a custom DateTime type that ensures timezone awareness
class TZDateTime(TypeDecorator):
    impl = DateTime
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            if value.tzinfo is None:
                value = value.replace(tzinfo=timezone.utc)
            else:
                value = value.astimezone(timezone.utc)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            if value.tzinfo is None:
                value = value.replace(tzinfo=timezone.utc)
            return value.astimezone(settings.TIMEZONE_OBJ)
        return value

engine = create_engine(
    DATABASE_URL, 
    echo=True,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Set timezone for SQLite
if DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA timezone='UTC'")
        cursor.close()
        
    # SQLAlchemy Connection doesn't have create_function, 
    # we need to access the raw SQLite connection
    @event.listens_for(engine, "connect")
    def register_functions(dbapi_connection, connection_record):
        if hasattr(dbapi_connection, "create_function"):
            dbapi_connection.create_function("timezone", 2, _timezone_converter)
        
def _timezone_converter(dt_str, tz_name):
    """Convert datetime string from UTC to specified timezone"""
    if dt_str is None:
        return None
    try:
        dt = datetime.datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
        target_tz = pytz.timezone(tz_name)
        return dt.astimezone(target_tz).isoformat()
    except Exception:
        return dt_str

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
# Helper function to get current time in the configured timezone
def get_current_time():
    """Returns the current time in the configured timezone"""
    utc_now = datetime.datetime.now(pytz.UTC)
    return utc_now.astimezone(settings.TIMEZONE_OBJ)
    
# Helper function to ensure datetimes are timezone-aware
def ensure_tz_aware(dt):
    """Ensures a datetime is timezone aware, defaulting to UTC if not"""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt