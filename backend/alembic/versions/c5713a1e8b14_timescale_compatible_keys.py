"""timescale compatible keys

Revision ID: c5713a1e8b14
Revises: 002b53f83e50
Create Date: 2026-10-26 21:42:08.333932

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c5713a1e8b14"
down_revision: str | Sequence[str] | None = "002b53f83e50"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_table("notes")
    op.execute("ALTER TABLE ticks DROP CONSTRAINT ticks_pkey")
    op.drop_column("ticks", "id")
    op.execute("ALTER TABLE ticks ALTER COLUMN timestamp SET NOT NULL")
    op.execute("ALTER TABLE ticks ADD PRIMARY KEY (stream_id, timestamp)")
    op.execute("CREATE EXTENSION IF NOT EXISTS timescaledb")
    op.execute("SELECT create_hypertable('ticks', by_range('timestamp'), migrate_data => true)")


def downgrade() -> None:
    raise NotImplementedError("one-way: hypertables cannot be turned back into plain tables")
