from app.modules.categorias.service import CategoriaNoEncontrada, obtener_categoria_activa
from app.modules.productos.models import Producto
from app.modules.productos.repository import ProductoRepository
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork

__all__ = ["CategoriaNoEncontrada", "ProductoNoEncontrado", "ProductoService"]


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"Producto {producto_id} no encontrado")


def obtener_producto_activo(repo: ProductoRepository, producto_id: int) -> Producto:
    """Un producto dado de baja se trata como inexistente."""
    producto = repo.get_by_id(producto_id)
    if producto is None or not producto.activo:
        raise ProductoNoEncontrado(producto_id)
    return producto


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        *,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(
                skip=skip, limit=limit, search=search, categoria_id=categoria_id, disponible=disponible
            )
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in productos]
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(obtener_producto_activo(uow.productos, producto_id))

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            obtener_categoria_activa(uow.categorias, datos.categoria_id)
            producto = uow.productos.add(Producto.model_validate(datos))
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = obtener_producto_activo(uow.productos, producto_id)
            # Los campos obligatorios no se pueden "borrar" enviando null.
            cambios = {
                campo: valor
                for campo, valor in datos.model_dump(exclude_unset=True).items()
                if valor is not None or campo in ("descripcion", "imagen_url")
            }
            if "categoria_id" in cambios:
                obtener_categoria_activa(uow.categorias, cambios["categoria_id"])
            producto.sqlmodel_update(cambios)
            uow.flush()
            uow.session.refresh(producto, ["categoria"])
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, datos: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = obtener_producto_activo(uow.productos, producto_id)
            producto.sqlmodel_update(datos.model_dump(exclude_none=True))
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        """Baja lógica: el producto deja de listarse y no se puede comprar."""
        with self.uow as uow:
            producto = obtener_producto_activo(uow.productos, producto_id)
            producto.activo = False
