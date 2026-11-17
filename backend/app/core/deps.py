from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status

from app.core.security import COOKIE_NAME, decode_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


def get_current_user(request: Request) -> Usuario:
    """Lee la cookie HttpOnly, valida firma y expiración del JWT y carga el usuario (401 si falla)."""
    no_autenticado = HTTPException(status.HTTP_401_UNAUTHORIZED, detail="No autenticado o sesión vencida")
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise no_autenticado
    username = decode_access_token(token)
    if username is None:
        raise no_autenticado
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
    if usuario is None:
        raise no_autenticado
    return usuario


def get_current_active_user(usuario: Annotated[Usuario, Depends(get_current_user)]) -> Usuario:
    if usuario.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=CUENTA_DESACTIVADA)
    return usuario


def require_role(roles: list[str]) -> Callable[[Usuario], Usuario]:
    def verificar_rol(usuario: Annotated[Usuario, Depends(get_current_active_user)]) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="No tenés permisos para esta operación")
        return usuario

    return verificar_rol


UsuarioActual = Annotated[Usuario, Depends(get_current_active_user)]
AdminActual = Annotated[Usuario, Depends(require_role(["admin"]))]
