"""native_enum_false

Revision ID: 7d328acdf3ce
Revises: 082a54adbf8b
Create Date: 2026-09-05 14:14:37.634831

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '7d328acdf3ce'
down_revision: Union[str, Sequence[str], None] = '082a54adbf8b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop defaults and constraints that depend on the old enum types
    op.drop_constraint('check_customer_role', 'users', type_='check')
    op.alter_column('customers', 'tier', server_default=None)
    op.alter_column('users', 'role', server_default=None)
    
    # Cast columns to VARCHAR
    op.execute("ALTER TABLE customers ALTER COLUMN tier TYPE VARCHAR(6) USING tier::text")
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(13) USING role::text")
    op.execute("ALTER TABLE verification_codes ALTER COLUMN purpose TYPE VARCHAR(19) USING purpose::text")
    
    # Drop the old enum types from postgres
    op.execute("DROP TYPE tierenum")
    op.execute("DROP TYPE roleenum")
    op.execute("DROP TYPE purposeenum")
    
    # Recreate the check constraint
    op.create_check_constraint('check_customer_role', 'users', "role != 'customer' OR customer_id IS NOT NULL")

def downgrade() -> None:
    # Drop the check constraint again
    op.drop_constraint('check_customer_role', 'users', type_='check')
    
    # Recreate the enum types
    op.execute("CREATE TYPE tierenum AS ENUM ('bronze', 'silver', 'gold')")
    op.execute("CREATE TYPE roleenum AS ENUM ('admin', 'sales_manager', 'finance', 'sales_rep', 'customer')")
    op.execute("CREATE TYPE purposeenum AS ENUM ('signup_verify', 'login_2fa', 'password_reset', 'invite_set_password', 'magic_link')")
    
    # Cast back to enum
    op.execute("ALTER TABLE customers ALTER COLUMN tier TYPE tierenum USING tier::tierenum")
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE roleenum USING role::roleenum")
    op.execute("ALTER TABLE verification_codes ALTER COLUMN purpose TYPE purposeenum USING purpose::purposeenum")
    
    # Recreate the check constraint
    op.create_check_constraint('check_customer_role', 'users', "role != 'customer' OR customer_id IS NOT NULL")
