"""make geocoding_cache timestamps timezone-aware

Revision ID: 0003
Revises: f1d6be256126
Create Date: 2026-05-25
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0003"
down_revision: Union[str, None] = "f1d6be256126"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("geocoding_cache", "created_at", type_=sa.TIMESTAMP(timezone=True), existing_type=sa.TIMESTAMP)
    op.alter_column("geocoding_cache", "expires_at", type_=sa.TIMESTAMP(timezone=True), existing_type=sa.TIMESTAMP)


def downgrade() -> None:
    op.alter_column("geocoding_cache", "created_at", type_=sa.TIMESTAMP, existing_type=sa.TIMESTAMP(timezone=True))
    op.alter_column("geocoding_cache", "expires_at", type_=sa.TIMESTAMP, existing_type=sa.TIMESTAMP(timezone=True))
