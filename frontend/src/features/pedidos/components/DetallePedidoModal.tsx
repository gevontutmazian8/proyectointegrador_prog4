import { SkeletonFilas } from '../../../shared/components/Skeleton'
import EstadoError from '../../../shared/components/EstadoError'
import Modal from '../../../shared/ui/Modal'
import { usePedido } from '../hooks/usePedidos'
import PedidoDetalle from './PedidoDetalle'

interface DetallePedidoModalProps {
  pedidoId: number | null
  onCerrar: () => void
}

/** Consulta GET /pedidos/{id} y muestra el detalle; lo usan el cliente y el admin. */
export default function DetallePedidoModal({ pedidoId, onCerrar }: DetallePedidoModalProps) {
  const pedido = usePedido(pedidoId)

  return (
    <Modal abierto={pedidoId !== null} titulo={`Pedido #${pedidoId ?? ''}`} onCerrar={onCerrar} ancho="lg">
      {pedido.isPending ? (
        <SkeletonFilas filas={4} />
      ) : pedido.isError ? (
        <EstadoError error={pedido.error} titulo="No pudimos cargar el pedido" />
      ) : (
        <PedidoDetalle pedido={pedido.data} />
      )}
    </Modal>
  )
}
