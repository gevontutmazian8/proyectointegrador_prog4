from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response, status

from app.core.deps import AdminActual
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import CategoriaNoEncontrada, ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["Productos"])

# Errores de dominio que puede lanzar el Service y su código HTTP.
ErrorProducto = (ProductoNoEncontrado, CategoriaNoEncontrada)
ERRORES: dict[type[Exception], int] = {
    ProductoNoEncontrado: status.HTTP_404_NOT_FOUND,
    CategoriaNoEncontrada: status.HTTP_404_NOT_FOUND,
}


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]
ProductoId = Annotated[int, Path(ge=1)]


def _a_http(error: Exception) -> HTTPException:
    return HTTPException(ERRORES.get(type(error), status.HTTP_400_BAD_REQUEST), detail=str(error))


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[str | None, Query(max_length=100)] = None,
    categoria_id: Annotated[int | None, Query(ge=1)] = None,
    disponible: bool | None = None,
) -> ProductosPaginados:
    return service.listar(
        skip=skip, limit=limit, search=search, categoria_id=categoria_id, disponible=disponible
    )


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: ProductoId, service: ServiceDep) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ErrorProducto as error:
        raise _a_http(error) from error


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(datos: ProductoCreate, _: AdminActual, service: ServiceDep) -> ProductoRead:
    try:
        return service.crear(datos)
    except ErrorProducto as error:
        raise _a_http(error) from error


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: ProductoId, datos: ProductoUpdate, _: AdminActual, service: ServiceDep
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, datos)
    except ErrorProducto as error:
        raise _a_http(error) from error


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: ProductoId, datos: ProductoStockUpdate, _: AdminActual, service: ServiceDep
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, datos)
    except ErrorProducto as error:
        raise _a_http(error) from error


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def eliminar_producto(producto_id: ProductoId, _: AdminActual, service: ServiceDep) -> Response:
    try:
        service.eliminar(producto_id)
    except ErrorProducto as error:
        raise _a_http(error) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)
