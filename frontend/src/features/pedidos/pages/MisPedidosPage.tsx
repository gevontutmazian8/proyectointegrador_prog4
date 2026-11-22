import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import EstadoError from '../../../shared/components/EstadoError'
import EstadoVacio from '../../../shared/components/EstadoVacio'
import Paginacion from '../../../shared/components/Paginacion'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import { EncabezadoPagina } from '../../../shared/layout/MainLayout'
import BadgeEstado from '../../../shared/ui/BadgeEstado'
import Button from '../../../shared/ui/Button'
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato'
import ConfirmarAccion from '../../../shared/components/ConfirmarAccion'
import DetallePedidoModal from '../components/DetallePedidoModal'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido'

const POR_PAGINA = 10

export default function MisPedidosPage() {
  const location = useLocation()
  const pedidoCreado = (location.state as { pedidoCreado?: number } | null)?.pedidoCreado
  const [pagina, setPagina] = useState(1)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)

  const pedidos = usePedidos({ skip: (pagina - 1) * POR_PAGINA, limit: POR_PAGINA })
  const cancelar = useCancelarPedido()

  async function confirmarCancelacion() {
    if (!aCancelar) return
    try {
      await cancelar.mutateAsync(aCancelar.id)
      setACancelar(null)
    } catch {
      // El error queda en cancelar.error y se muestra en el diálogo.
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <EncabezadoPagina titulo="Mis pedidos" descripcion="Seguí el estado de tus pedidos." />

      {pedidoCreado && pedidos.data?.items.find((p) => p.id === pedidoCreado)?.estado === 'PENDIENTE' && (
        <p className="animar-entrada mb-6 border-l-4 border-naranja bg-naranja/10 px-4 py-3 text-naranja-oscuro">
          ¡Listo! Tu pedido #{pedidoCreado} fue creado y está pendiente de preparación.
        </p>
      )}

      {pedidos.isPending ? (
        <SkeletonFilas filas={4} />
      ) : pedidos.isError ? (
        <EstadoError error={pedidos.error} onReintentar={() => void pedidos.refetch()} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hiciste pedidos"
          descripcion="Cuando confirmes uno, vas a poder seguirlo desde acá."
          accion={
            <Link to="/" className="bg-carbon px-5 py-2.5 text-sm uppercase tracking-[0.12em] text-white hover:bg-naranja-oscuro">
              Ir al catálogo
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          <ul className="divide-y divide-tinta/10 border-y border-tinta/10">
            {pedidos.data.items.map((p) => (
              <li key={p.id} className="flex flex-col gap-4 py-5 even:bg-arena/60 sm:flex-row sm:items-center sm:px-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-medium">Pedido #{p.id}</p>
                    <BadgeEstado estado={p.estado} />
                  </div>
                  <p className="mt-1 text-sm text-tinta/60">
                    {formatearFecha(p.created_at)} · {p.items.reduce((s, d) => s + d.cantidad, 0)} producto(s) ·{' '}
                    {p.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}
                  </p>
                </div>
                <p className="text-xl font-medium tabular-nums">{formatearPrecio(p.total)}</p>
                <div className="flex gap-2">
                  <Button variante="secundario" tamano="sm" onClick={() => setDetalleId(p.id)}>
                    Ver detalle
                  </Button>
                  {p.estado === 'PENDIENTE' && (
                    <Button
                      variante="peligro"
                      tamano="sm"
                      onClick={() => {
                        cancelar.reset()
                        setACancelar(p)
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <Paginacion
            pagina={pagina}
            totalPaginas={Math.ceil(pedidos.data.total / POR_PAGINA)}
            onCambiar={setPagina}
            deshabilitado={pedidos.isPlaceholderData}
          />
        </div>
      )}

      <DetallePedidoModal pedidoId={detalleId} onCerrar={() => setDetalleId(null)} />

      <ConfirmarAccion
        abierto={aCancelar !== null}
        titulo="Cancelar pedido"
        mensaje={
          <>
            ¿Querés cancelar el pedido <strong>#{aCancelar?.id}</strong> por{' '}
            <strong>{aCancelar ? formatearPrecio(aCancelar.total) : ''}</strong>? Esta acción no se puede deshacer.
          </>
        }
        textoConfirmar="Sí, cancelar"
        peligro
        procesando={cancelar.isPending}
        error={cancelar.isError ? handleApiError(cancelar.error) : null}
        onConfirmar={() => void confirmarCancelacion()}
        onCancelar={() => setACancelar(null)}
      />
    </div>
  )
}
