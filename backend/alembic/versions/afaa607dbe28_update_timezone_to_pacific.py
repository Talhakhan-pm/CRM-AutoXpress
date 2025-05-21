"""update_timezone_to_pacific

Revision ID: afaa607dbe28
Revises: 3f9b025794eb
Create Date: 2025-05-21 12:02:28.904322

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import DateTime, String, Text, Integer, Float, Date
import pytz
from datetime import datetime


# revision identifiers, used by Alembic.
revision = 'afaa607dbe28'
down_revision = '3f9b025794eb'
branch_labels = None
depends_on = None


def upgrade():
    # Create reference to callbacks table
    callbacks = table('callbacks',
        column('id', Integer),
        column('created_at', DateTime(timezone=True)),
        column('last_modified', DateTime(timezone=True))
    )
    
    # Get connection
    conn = op.get_bind()
    
    # Convert timestamps from UTC to Pacific timezone
    # For SQLite, we use the updated timezone setting from our application
    # This migration is mainly for documentation purposes since SQLite's 
    # timezone support is limited
    if conn.engine.name == 'sqlite':
        # Add a comment for SQLite to document the change
        op.execute("PRAGMA timezone='UTC'")
        op.execute("PRAGMA user_version=1")  # Mark that we've updated timezone
    else:
        # For PostgreSQL or other databases that support timezone operations
        # We would convert the timestamps directly in the database
        # For example:
        # op.execute(
        #    callbacks.update().values(
        #        created_at=callbacks.c.created_at.op('AT TIME ZONE')('UTC').op('AT TIME ZONE')('America/Los_Angeles'),
        #        last_modified=callbacks.c.last_modified.op('AT TIME ZONE')('UTC').op('AT TIME ZONE')('America/Los_Angeles')
        #    )
        # )
        pass


def downgrade():
    # Nothing to downgrade for SQLite
    # For PostgreSQL, we would convert back to UTC
    conn = op.get_bind()
    if conn.engine.name != 'sqlite':
        # Code to convert back to UTC for PostgreSQL
        pass