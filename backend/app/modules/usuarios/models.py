from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.core.database import utc_now

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido

ROL_USER = "user"
ROL_ADMIN = "admin"


class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"  # type: ignore[assignment]

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, max_length=50)
    full_name: str = Field(max_length=120)
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: str
    role: str = Field(default=ROL_USER, max_length=20)
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utc_now, sa_type=DateTime(timezone=True))  # type: ignore[call-overload]

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
