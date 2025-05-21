"""update_datetime_columns_with_tzdatetime

Revision ID: defb758fff02
Revises: afaa607dbe28
Create Date: 2025-05-21 12:10:45.352474

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import DateTime, String, Text, Integer, Float, Date
import pytz
from datetime import datetime, timezone


# revision identifiers, used by Alembic.
revision = 'defb758fff02'
down_revision = 'afaa607dbe28'
branch_labels = None
depends_on = None


def upgrade():
    # For SQLite, altering column types isn't well supported
    # So we'll use a more direct approach
    conn = op.get_bind()
    
    if conn.engine.name == 'sqlite':
        # Create a reference to the callbacks table
        callbacks = table('callbacks',
            column('id', Integer),
            column('created_at', DateTime(timezone=True)),
            column('last_modified', DateTime(timezone=True))
        )
        
        # Update all existing datetime values to include timezone info
        # For SQLite, this is just a marker that we're handling timezone correctly now
        op.execute("""
        UPDATE callbacks 
        SET created_at = strftime('%Y-%m-%dT%H:%M:%S.000+00:00', created_at),
            last_modified = strftime('%Y-%m-%dT%H:%M:%S.000+00:00', last_modified)
        WHERE created_at IS NOT NULL AND last_modified IS NOT NULL
        """)
    else:
        # For PostgreSQL, we would use a different approach
        # Alter column types to use timezone
        # op.alter_column('callbacks', 'created_at', 
        #                 type_=sa.DateTime(timezone=True),
        #                 existing_type=sa.DateTime())
        # op.alter_column('callbacks', 'last_modified', 
        #                 type_=sa.DateTime(timezone=True),
        #                 existing_type=sa.DateTime())
        pass


def downgrade():
    # Nothing to downgrade for SQLite
    # For PostgreSQL, we would convert back to non-timezone-aware columns
    conn = op.get_bind()
    if conn.engine.name != 'sqlite':
        # op.alter_column('callbacks', 'created_at', 
        #                 type_=sa.DateTime(),
        #                 existing_type=sa.DateTime(timezone=True))
        # op.alter_column('callbacks', 'last_modified', 
        #                 type_=sa.DateTime(),
        #                 existing_type=sa.DateTime(timezone=True))
        pass