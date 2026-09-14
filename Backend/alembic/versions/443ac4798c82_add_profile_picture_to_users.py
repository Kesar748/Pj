"""add profile_picture to users

Revision ID: 443ac4798c82
Revises: 20260909_0002
Create Date: 2026-09-14 11:27:09.776418
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '443ac4798c82'
down_revision: Union[str, Sequence[str], None] = '20260909_0002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column('profile_picture', sa.String(length=255), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('users', 'profile_picture')