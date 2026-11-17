from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.deps import AdminActual, UsuarioActual
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoError,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

ERRORES: dict[type[PedidoError], int] = {
    PedidoNoEncontrado: status.HTTP_404_NOT_FOUND,
    ProductoNoEncontrado: status.HTTP_404_NOT_FOUND,
    PedidoAjeno: status.HTTP_403_FORBIDDEN,
    StockInsuficiente: status.HTTP_400_BAD_REQUEST,
    ProductoNoDisponible: status.HTTP_400_BAD_REQUEST,
    ProductoRepetido: status.HTTP_400_BAD_REQUEST,
    TransicionInvalida: status.HTTP_400_BAD_REQUEST,
}


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]
PedidoId = Annotated[int, Path(ge=1)]


def _a_http(error: PedidoError) -> HTTPException:
    return HTTPException(ERRORES.get(type(error), status.HTTP_400_BAD_REQUEST), detail=str(error))


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(datos: PedidoCreate, usuario: UsuarioActual, service: ServiceDep) -> PedidoRead:
    try:
        return service.crear(usuario, datos)
    except PedidoError as error:
        raise _a_http(error) from error


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: UsuarioActual,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
) -> PedidosPaginados:
    return service.listar(usuario, estado=estado, skip=skip, limit=limit)


# Se declara antes de /{pedido_id} para que "resumen" no se interprete como un id.
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_: AdminActual, service: ServiceDep) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: PedidoId, usuario: UsuarioActual, service: ServiceDep) -> PedidoRead:
    try:
        return service.obtener(usuario, pedido_id)
    except PedidoError as error:
        raise _a_http(error) from error


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(
    pedido_id: PedidoId, datos: CambioEstado, _: AdminActual, service: ServiceDep
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, datos)
    except PedidoError as error:
        raise _a_http(error) from error


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: PedidoId, usuario: UsuarioActual, service: ServiceDep) -> PedidoRead:
    try:
        return service.cancelar(usuario, pedido_id)
    except PedidoError as error:
        raise _a_http(error) from error
