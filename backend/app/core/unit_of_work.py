from collections.abc import Callable
from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Abre la sesión en __enter__ y hace commit, rollback y close en __exit__.

    Las subclases crean sus repositorios en `_crear_repositorios`, todos sobre la misma sesión,
    así una operación que toca varias tablas se confirma o se descarta completa.
    """

    def __init__(self, factory: Callable[[], Session] = session_factory) -> None:
        self._factory = factory
        self._session: Session | None = None

    @property
    def session(self) -> Session:
        if self._session is None:
            raise RuntimeError("El Unit of Work no está abierto: usá 'with uow:'")
        return self._session

    def __enter__(self) -> Self:
        self._session = self._factory()
        self._crear_repositorios(self._session)
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        session = self.session
        try:
            if exc_type is None:
                session.commit()
            else:
                session.rollback()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
            self._session = None

    def flush(self) -> None:
        """Envía los cambios pendientes sin confirmar la transacción (asigna ids)."""
        self.session.flush()

    def _crear_repositorios(self, session: Session) -> None:
        """Las subclases instancian aquí sus repositorios."""
