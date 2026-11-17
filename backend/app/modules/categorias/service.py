from app.modules.categorias.models import Categoria
from app.modules.categorias.repository import CategoriaRepository
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaError(Exception):
    """Base de los errores de dominio de categorías."""


class CategoriaNoEncontrada(CategoriaError):
    def __init__(self, categoria_id: int) -> None:
        super().__init__(f"Categoría {categoria_id} no encontrada")


class NombreDuplicado(CategoriaError):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"Ya existe una categoría llamada '{nombre}'")


def obtener_categoria_activa(repo: CategoriaRepository, categoria_id: int) -> Categoria:
    """Una categoría dada de baja se trata como inexistente. Lo reutiliza el módulo productos."""
    categoria = repo.get_by_id(categoria_id)
    if categoria is None or not categoria.activo:
        raise CategoriaNoEncontrada(categoria_id)
    return categoria


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(obtener_categoria_activa(uow.categorias, categoria_id))

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(datos.nombre) is not None:
                raise NombreDuplicado(datos.nombre)
            categoria = uow.categorias.add(Categoria.model_validate(datos))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, datos: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = obtener_categoria_activa(uow.categorias, categoria_id)
            cambios = datos.model_dump(exclude_unset=True)
            nombre = cambios.get("nombre")
            if nombre is None:
                cambios.pop("nombre", None)  # el nombre es obligatorio: un null no lo borra
            else:
                existente = uow.categorias.get_by_nombre(nombre)
                if existente is not None and existente.id != categoria.id:
                    raise NombreDuplicado(nombre)
            categoria.sqlmodel_update(cambios)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica: no libera el nombre ni oculta los productos de la categoría."""
        with self.uow as uow:
            categoria = obtener_categoria_activa(uow.categorias, categoria_id)
            categoria.activo = False
