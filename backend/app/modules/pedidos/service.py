from datetime import datetime

from app.core.database import utc_now
from app.modules.pedidos.models import (
    CANCELADO,
    EN_PREPARACION,
    ENTREGADO,
    PENDIENTE,
    DetallePedido,
    Pedido,
)
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import ROL_ADMIN, Usuario

# RN-02: máquina de estados. ENTREGADO y CANCELADO son terminales (sin transiciones).
TRANSICIONES: dict[str, set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),
    CANCELADO: set(),
}


# --- Excepciones de dominio (el Router las traduce a HTTPException) ---------------------------


class PedidoError(Exception):
    """Base de los errores de dominio de pedidos."""


class PedidoNoEncontrado(PedidoError):
    def __init__(self, pedido_id: int) -> None:
        super().__init__(f"Pedido {pedido_id} no encontrado")


class ProductoNoEncontrado(PedidoError):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"Producto {producto_id} no encontrado o dado de baja")


class PedidoAjeno(PedidoError):
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class ProductoRepetido(PedidoError):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"El producto {producto_id} está repetido en el pedido")


class ProductoNoDisponible(PedidoError):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"El producto '{nombre}' no está disponible para la venta")


class StockInsuficiente(PedidoError):
    def __init__(self, nombre: str, disponible: int, pedido: int) -> None:
        super().__init__(f"Stock insuficiente de '{nombre}': hay {disponible} y se pidieron {pedido}")


class TransicionInvalida(PedidoError):
    def __init__(self, actual: str, nuevo: str) -> None:
        super().__init__(f"No se puede pasar un pedido de {actual} a {nuevo}")


# --- Service -----------------------------------------------------------------------------------


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def crear(self, usuario: Usuario, datos: PedidoCreate) -> PedidoRead:
        """RN-01: crea el pedido, descuenta stock y copia nombre y precio en una sola transacción.

        Si cualquier validación falla, la excepción sale del bloque `with` y el Unit of Work
        hace rollback: no queda el pedido, ni sus líneas, ni ningún descuento de stock.
        """
        with self.uow as uow:
            vistos: set[int] = set()
            for item in datos.items:
                if item.producto_id in vistos:
                    raise ProductoRepetido(item.producto_id)
                vistos.add(item.producto_id)

            assert usuario.id is not None
            pedido = Pedido(
                usuario_id=usuario.id,
                estado=PENDIENTE,
                forma_pago=datos.forma_pago,
                direccion_entrega=datos.direccion_entrega,
                notas=datos.notas or None,
                total=0,
            )
            uow.pedidos.add(pedido)  # el flush asigna pedido.id para las líneas
            assert pedido.id is not None

            # Se bloquean las filas en orden de id para que dos pedidos concurrentes no se traben.
            productos = {pid: uow.productos.get_for_update(pid) for pid in sorted(vistos)}

            total = 0.0
            for item in datos.items:
                producto = productos[item.producto_id]
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)

                producto.stock -= item.cantidad
                # El precio sale de la base, nunca del navegador; la línea guarda una copia (RN-05).
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=item.producto_id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.flush()
            return PedidoRead.model_validate(pedido)

    def listar(
        self, usuario: Usuario, *, estado: str | None, skip: int, limit: int
    ) -> PedidosPaginados:
        # RN-04: el cliente solo ve sus pedidos; el admin ve todos.
        filtro_usuario = None if usuario.role == ROL_ADMIN else usuario.id
        with self.uow as uow:
            total, pedidos = uow.pedidos.list_by_usuario(
                usuario_id=filtro_usuario, estado=estado, skip=skip, limit=limit
            )
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, usuario: Usuario, pedido_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            if usuario.role != ROL_ADMIN and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, datos: CambioEstado) -> PedidoRead:
        """Admin: avanza o cancela según la máquina de estados (RN-02, RN-03)."""
        with self.uow as uow:
            pedido = self._obtener_bloqueado(uow, pedido_id)
            self._aplicar_transicion(uow, pedido, datos.estado)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, usuario: Usuario, pedido_id: int) -> PedidoRead:
        """Dueño: cancela su pedido solo si está PENDIENTE (RN-03, RN-04)."""
        with self.uow as uow:
            pedido = self._obtener_bloqueado(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != PENDIENTE:
                raise TransicionInvalida(pedido.estado, CANCELADO)
            self._aplicar_transicion(uow, pedido, CANCELADO)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=conteos.get(PENDIENTE, 0),
                en_preparacion=conteos.get(EN_PREPARACION, 0),
                entregados=conteos.get(ENTREGADO, 0),
                cancelados=conteos.get(CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_desde(_inicio_del_dia()),
                ingresos_entregados=round(uow.pedidos.sum_total_por_estado(ENTREGADO), 2),
            )

    # --- auxiliares ----------------------------------------------------------------------------

    @staticmethod
    def _obtener_bloqueado(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_for_update(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    @staticmethod
    def _aplicar_transicion(uow: PedidoUnitOfWork, pedido: Pedido, nuevo: str) -> None:
        if nuevo not in TRANSICIONES[pedido.estado]:
            raise TransicionInvalida(pedido.estado, nuevo)
        if nuevo == CANCELADO:
            # RN-03: se restituye el stock en la misma transacción que cambia el estado.
            # Como CANCELADO es terminal, una segunda cancelación falla antes de llegar acá.
            for detalle in pedido.items:
                producto = uow.productos.get_for_update(detalle.producto_id)
                if producto is not None:
                    producto.stock += detalle.cantidad
        pedido.estado = nuevo
        pedido.updated_at = utc_now()


def _inicio_del_dia() -> datetime:
    """Medianoche de hoy en la zona horaria del servidor."""
    ahora = datetime.now().astimezone()
    return ahora.replace(hour=0, minute=0, second=0, microsecond=0)
