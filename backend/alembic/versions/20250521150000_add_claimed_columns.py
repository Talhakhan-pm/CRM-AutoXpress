"""add claimed columns

Revision ID: 20250521150000
Revises: fd9393f02183
Create Date: 2025-05-21 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20250521150000'
down_revision = 'fd9393f02183'
branch_labels = None
depends_on = None


def upgrade():
    # Create callback_activities table
    try:
        op.create_table('callback_activities',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('callback_id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.String(), nullable=True),
            sa.Column('activity_type', sa.String(length=50), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('previous_value', sa.Text(), nullable=True),
            sa.Column('new_value', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['callback_id'], ['callbacks.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_callback_activities_callback_id', 'callback_activities', ['callback_id'], unique=False)
        op.create_index('ix_callback_activities_id', 'callback_activities', ['id'], unique=False)
        op.create_index('ix_callback_activities_user_id', 'callback_activities', ['user_id'], unique=False)
    except Exception as e:
        # Table might already exist
        pass
    
    # Add claimed_by column if it doesn't exist
    try:
        op.add_column('callbacks', sa.Column('claimed_by', sa.String(), nullable=True))
        op.create_index('ix_callbacks_claimed_by', 'callbacks', ['claimed_by'], unique=False)
    except Exception as e:
        # Column might already exist
        pass
    
    # Add claimed_at column if it doesn't exist
    try:
        op.add_column('callbacks', sa.Column('claimed_at', sa.DateTime(timezone=True), nullable=True))
    except Exception as e:
        # Column might already exist
        pass


def downgrade():
    # Remove claimed_at and claimed_by columns if they exist
    try:
        op.drop_index('ix_callbacks_claimed_by', table_name='callbacks')
        op.drop_column('callbacks', 'claimed_at')
        op.drop_column('callbacks', 'claimed_by')
    except Exception as e:
        # Columns might not exist
        pass
        
    # Drop callback_activities table if it exists
    try:
        op.drop_index('ix_callback_activities_user_id', table_name='callback_activities')
        op.drop_index('ix_callback_activities_id', table_name='callback_activities')
        op.drop_index('ix_callback_activities_callback_id', table_name='callback_activities')
        op.drop_table('callback_activities')
    except Exception as e:
        # Table might not exist
        pass