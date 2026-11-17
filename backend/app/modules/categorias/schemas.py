from pydantic import field_validator
from sqlmodel import Field, SQLModel


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=255)

    @field_validator("nombre", mode="before")
    @classmethod
    def quitar_espacios(cls, valor: object) -> object:
        return valor.strip() if isinstance(valor, str) else valor


class CategoriaUpdate(SQLModel):
    """Actualización parcial: solo se modifican los campos enviados."""

    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=255)

    @field_validator("nombre", mode="before")
    @classmethod
    def quitar_espacios(cls, valor: object) -> object:
        return valor.strip() if isinstance(valor, str) else valor


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool
