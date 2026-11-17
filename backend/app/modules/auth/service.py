from app.core.deps import CUENTA_DESACTIVADA
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.auth.schemas import UserCreate, UserPublic
from app.modules.usuarios.models import ROL_USER, Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthError(Exception):
    """Base de los errores de dominio de autenticación."""


class UsuarioDuplicado(AuthError):
    def __init__(self, campo: str) -> None:
        super().__init__(f"Ya existe un usuario con ese {campo}")


class CredencialesInvalidas(AuthError):
    def __init__(self) -> None:
        super().__init__("Usuario o contraseña incorrectos")


class CuentaDesactivada(AuthError):
    def __init__(self) -> None:
        super().__init__(CUENTA_DESACTIVADA)


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, datos: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(datos.username) is not None:
                raise UsuarioDuplicado("username")
            if uow.usuarios.get_by_email(datos.email) is not None:
                raise UsuarioDuplicado("email")
            usuario = Usuario(
                username=datos.username,
                full_name=datos.full_name,
                email=datos.email.lower(),
                hashed_password=hash_password(datos.password),
                role=ROL_USER,  # el registro público nunca crea administradores
            )
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def autenticar(self, username: str, password: str) -> str:
        """Valida las credenciales y devuelve el JWT que el router guarda en la cookie."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise CredencialesInvalidas()
            if usuario.disabled:
                raise CuentaDesactivada()
            return create_access_token(usuario.username)
