from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import UsuarioActual
from app.core.security import COOKIE_NAME
from app.modules.auth.schemas import MensajeRespuesta, UserCreate, UserPublic
from app.modules.auth.service import (
    AuthError,
    AuthService,
    CredencialesInvalidas,
    CuentaDesactivada,
    UsuarioDuplicado,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Autenticación"])

ERRORES: dict[type[AuthError], int] = {
    UsuarioDuplicado: status.HTTP_409_CONFLICT,
    CredencialesInvalidas: status.HTTP_401_UNAUTHORIZED,
    CuentaDesactivada: status.HTTP_400_BAD_REQUEST,
}


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


ServiceDep = Annotated[AuthService, Depends(get_auth_service)]


def _a_http(error: AuthError) -> HTTPException:
    return HTTPException(ERRORES.get(type(error), status.HTTP_400_BAD_REQUEST), detail=str(error))


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def registrar(datos: UserCreate, service: ServiceDep) -> UserPublic:
    try:
        return service.registrar(datos)
    except AuthError as error:
        raise _a_http(error) from error


@router.post("/token", response_model=MensajeRespuesta)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: ServiceDep,
) -> MensajeRespuesta:
    try:
        token = service.autenticar(form.username, form.password)
    except AuthError as error:
        raise _a_http(error) from error

    duracion = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    # El JWT viaja solo en la cookie HttpOnly: JavaScript no puede leerlo y no va en el cuerpo.
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=duracion,
        expires=duracion,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        path="/",
    )
    return MensajeRespuesta(message="Login exitoso")


@router.post("/logout", response_model=MensajeRespuesta)
def logout(response: Response) -> MensajeRespuesta:
    response.delete_cookie(
        key=COOKIE_NAME, path="/", httponly=True, samesite="lax", secure=settings.COOKIE_SECURE
    )
    return MensajeRespuesta(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def perfil(usuario: UsuarioActual) -> UserPublic:
    return UserPublic.model_validate(usuario)
