import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import ConfirmarAccion from '../../../shared/components/ConfirmarAccion'
import EstadoError from '../../../shared/components/EstadoError'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import TablaDatos from '../../../shared/components/TablaDatos'
import { EncabezadoPagina } from '../../../shared/layout/MainLayout'
import BadgeEstado from '../../../shared/ui/BadgeEstado'
import Button from '../../../shared/ui/Button'
import { Select } from '../../../shared/ui/Input'
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato'
import DetallePedidoModal from '../components/DetallePedidoModal'
import { useUsuarios } from '../../usuarios/hooks/useUsuarios'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { ESTADOS, NOMBRE_ESTADO, TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido'

const ACCION_AVANZAR: Partial<Record<EstadoPedido, string>> = {
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Entregar',
}

interface CambioPendiente {
  pedido: Pedido
  estado: EstadoPedido
}

function esEstado(valor: string): valor is EstadoPedido {
  return (ESTADOS as string[]).includes(valor)
}

export default function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [cambio, setCambio] = useState<CambioPendiente | null>(null)

  // El panel trae hasta 100 pedidos y pagina del lado del cliente con TanStack Table.
  const pedidos = usePedidos({ skip: 0, limit: 100, estado })
  const cambiarEstado = useCambiarEstadoPedido()
  // PedidoRead solo trae usuario_id: el nombre del cliente sale del listado de usuarios del panel.
  const usuarios = useUsuarios()
  const nombresClientes = useMemo(
    () => new Map((usuarios.data ?? []).map((u) => [u.id, `${u.full_name} (@${u.username})`])),
    [usuarios.data],
  )

  async function confirmarCambio() {
    if (!cambio) return
    try {
      await cambiarEstado.mutateAsync({ id: cambio.pedido.id, estado: cambio.estado })
      setCambio(null)
    } catch {
      // Se muestra en el diálogo a partir de cambiarEstado.error.
    }
  }

  const columnas = useMemo<ColumnDef<Pedido>[]>(
    () => [
      { id: 'id', header: 'N.º', accessorFn: (p) => p.id, cell: ({ row }) => `#${row.original.id}` },
      {
        id: 'fecha',
        header: 'Fecha',
        accessorFn: (p) => p.created_at,
        cell: ({ row }) => formatearFecha(row.original.created_at),
      },
      {
        id: 'usuario',
        header: 'Cliente',
        accessorFn: (p) => nombresClientes.get(p.usuario_id) ?? `Usuario ${p.usuario_id}`,
      },
      {
        id: 'estado',
        header: 'Estado',
        accessorFn: (p) => p.estado,
        cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
      },
      {
        id: 'pago',
        header: 'Pago',
        accessorFn: (p) => p.forma_pago,
        cell: ({ row }) => (row.original.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'),
      },
      {
        id: 'total',
        header: 'Total',
        accessorFn: (p) => p.total,
        cell: ({ row }) => <span className="tabular-nums">{formatearPrecio(row.original.total)}</span>,
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => {
          const pedido = row.original
          const siguientes = TRANSICIONES[pedido.estado]
          const avanzar = siguientes.find((e) => e !== 'CANCELADO')
          return (
            <div className="flex flex-wrap gap-2">
              <Button variante="secundario" tamano="sm" onClick={() => setDetalleId(pedido.id)}>
                Detalle
              </Button>
              {avanzar && (
                <Button
                  tamano="sm"
                  onClick={() => {
                    cambiarEstado.reset()
                    setCambio({ pedido, estado: avanzar })
                  }}
                >
                  {ACCION_AVANZAR[avanzar]}
                </Button>
              )}
              {siguientes.includes('CANCELADO') && (
                <Button
                  variante="peligro"
                  tamano="sm"
                  onClick={() => {
                    cambiarEstado.reset()
                    setCambio({ pedido, estado: 'CANCELADO' })
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          )
        },
      },
    ],
    [cambiarEstado, nombresClientes],
  )

  return (
    <>
      <EncabezadoPagina titulo="Pedidos" descripcion="Avanzá o cancelá pedidos según la máquina de estados." />

      <div className="mb-6 max-w-xs">
        <label htmlFor="filtro-estado" className="mb-1 block text-sm text-tinta/80">
          Filtrar por estado
        </label>
        <Select
          id="filtro-estado"
          value={estado ?? ''}
          onChange={(e) => setEstado(esEstado(e.target.value) ? e.target.value : undefined)}
        >
          <option value="">Todos</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {NOMBRE_ESTADO[e]}
            </option>
          ))}
        </Select>
      </div>

      {pedidos.isPending ? (
        <SkeletonFilas />
      ) : pedidos.isError ? (
        <EstadoError error={pedidos.error} onReintentar={() => void pedidos.refetch()} />
      ) : (
        <TablaDatos datos={pedidos.data.items} columnas={columnas} mensajeVacio="No hay pedidos con ese estado." />
      )}

      <DetallePedidoModal pedidoId={detalleId} onCerrar={() => setDetalleId(null)} />

      <ConfirmarAccion
        abierto={cambio !== null}
        titulo={cambio?.estado === 'CANCELADO' ? 'Cancelar pedido' : 'Cambiar estado'}
        mensaje={
          cambio && (
            <>
              El pedido <strong>#{cambio.pedido.id}</strong> pasará de{' '}
              <strong>{NOMBRE_ESTADO[cambio.pedido.estado]}</strong> a <strong>{NOMBRE_ESTADO[cambio.estado]}</strong>.
              {cambio.estado === 'CANCELADO' && ' El stock de sus productos se restituye automáticamente.'}
            </>
          )
        }
        textoConfirmar={cambio?.estado === 'CANCELADO' ? 'Sí, cancelar' : 'Confirmar'}
        peligro={cambio?.estado === 'CANCELADO'}
        procesando={cambiarEstado.isPending}
        error={cambiarEstado.isError ? handleApiError(cambiarEstado.error) : null}
        onConfirmar={() => void confirmarCambio()}
        onCancelar={() => setCambio(null)}
      />
    </>
  )
}
