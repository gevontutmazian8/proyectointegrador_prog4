from datetime import UTC, datetime

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings


def _normalizar_url(url: str) -> str:
    # SQLAlchemy 2.1 usa psycopg 3 por defecto para "postgresql://"; el proyecto usa psycopg2.
    if url.startswith("postgresql://"):
        return "postgresql+psycopg2://" + url.removeprefix("postgresql://")
    return url


DATABASE_URL = _normalizar_url(settings.DATABASE_URL)
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# pool_pre_ping descarta conexiones cortadas (por ejemplo, si PostgreSQL se reinició).
engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=_connect_args)


def utc_now() -> datetime:
    return datetime.now(UTC)


def create_all_tables() -> None:
    # Importar el paquete de módulos registra las cinco tablas en SQLModel.metadata.
    import app.modules  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    # expire_on_commit=False: los objetos siguen legibles después del commit del Unit of Work.
    return Session(engine, expire_on_commit=False)
