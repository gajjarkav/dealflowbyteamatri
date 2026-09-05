from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import DateTime
from datetime import datetime, timezone
from typing import Any

class Base(DeclarativeBase):
    pass
