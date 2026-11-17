from sqlmodel import SQLModel

# El registro y el perfil reutilizan los schemas del módulo usuarios.
from app.modules.usuarios.schemas import UserCreate, UserPublic


class MensajeRespuesta(SQLModel):
    message: str


__all__ = ["MensajeRespuesta", "UserCreate", "UserPublic"]
