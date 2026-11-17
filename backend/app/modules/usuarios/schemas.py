from datetime import datetime

from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    # bcrypt solo usa los primeros 72 bytes: se limita el largo para no truncar en silencio.
    password: str = Field(min_length=8, max_length=72)

    @field_validator("username", "full_name", mode="before")
    @classmethod
    def quitar_espacios(cls, valor: object) -> object:
        return valor.strip() if isinstance(valor, str) else valor


class UserPublic(SQLModel):
    """Datos públicos del usuario: nunca incluye hashed_password."""

    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
