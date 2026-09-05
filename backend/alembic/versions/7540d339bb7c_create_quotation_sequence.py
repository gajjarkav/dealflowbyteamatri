"""create_quotation_sequence

Revision ID: 7540d339bb7c
Revises: a87b164cc94a
Create Date: 2026-09-05 15:29:54.875641

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = '7540d339bb7c'
down_revision: Union[str, Sequence[str], None] = 'a87b164cc94a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(text("CREATE SEQUENCE IF NOT EXISTS quotation_seq START WITH 1 INCREMENT BY 1;"))


def downgrade() -> None:
    """Downgrade schema."""
    op.execute(text("DROP SEQUENCE IF NOT EXISTS quotation_seq;"))
