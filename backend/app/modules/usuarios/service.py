from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioError(Exception):
    """Base de los errores de dominio de usuarios."""


class UsuarioNoEncontrado(UsuarioError):
    def __init__(self, usuario_id: int) -> None:
        super().__init__(f"Usuario {usuario_id} no encontrado")


class AutoDesactivacion(UsuarioError):
    def __init__(self) -> None:
        super().__init__("Un administrador no puede desactivarse a sí mismo")


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_ordenados()]

    def activar(self, usuario_id: int) -> UserPublic:
        # Idempotente: si ya estaba activo responde igual con 200.
        with self.uow as uow:
            usuario = self._obtener(uow, usuario_id)
            usuario.disabled = False
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, admin_actual: Usuario) -> UserPublic:
        with self.uow as uow:
            usuario = self._obtener(uow, usuario_id)
            if usuario.id == admin_actual.id:
                raise AutoDesactivacion()
            usuario.disabled = True
            return UserPublic.model_validate(usuario)

    @staticmethod
    def _obtener(uow: UsuarioUnitOfWork, usuario_id: int) -> Usuario:
        usuario = uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise UsuarioNoEncontrado(usuario_id)
        return usuario
