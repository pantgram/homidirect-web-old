"""make availability_slots timestamps timezone-aware

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-18
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("availability_slots", "start_time", type_=sa.TIMESTAMP(timezone=True), existing_type=sa.TIMESTAMP)
    op.alter_column("availability_slots", "end_time", type_=sa.TIMESTAMP(timezone=True), existing_type=sa.TIMESTAMP)
    op.alter_column("availability_slots", "created_at", type_=sa.TIMESTAMP(timezone=True), existing_type=sa.TIMESTAMP)


def downgrade() -> None:
    op.alter_column("availability_slots", "start_time", type_=sa.TIMESTAMP, existing_type=sa.TIMESTAMP(timezone=True))
    op.alter_column("availability_slots", "end_time", type_=sa.TIMESTAMP, existing_type=sa.TIMESTAMP(timezone=True))
    op.alter_column("availability_slots", "created_at", type_=sa.TIMESTAMP, existing_type=sa.TIMESTAMP(timezone=True))
