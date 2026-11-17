from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.deps import AdminActual
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    AutoDesactivacion,
    UsuarioError,
    UsuarioNoEncontrado,
    UsuarioService,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])

ERRORES: dict[type[UsuarioError], int] = {
    UsuarioNoEncontrado: status.HTTP_404_NOT_FOUND,
    AutoDesactivacion: status.HTTP_400_BAD_REQUEST,
}


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]
UsuarioId = Annotated[int, Path(ge=1)]


def _a_http(error: UsuarioError) -> HTTPException:
    return HTTPException(ERRORES.get(type(error), status.HTTP_400_BAD_REQUEST), detail=str(error))


@router.get("", response_model=list[UserPublic])
def listar_usuarios(_: AdminActual, service: ServiceDep) -> list[UserPublic]:
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(usuario_id: UsuarioId, _: AdminActual, service: ServiceDep) -> UserPublic:
    try:
        return service.activar(usuario_id)
    except UsuarioError as error:
        raise _a_http(error) from error


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(usuario_id: UsuarioId, admin: AdminActual, service: ServiceDep) -> UserPublic:
    try:
        return service.desactivar(usuario_id, admin)
    except UsuarioError as error:
        raise _a_http(error) from error
