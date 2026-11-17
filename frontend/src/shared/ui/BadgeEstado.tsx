import { NOMBRE_ESTADO, type EstadoPedido } from '../../features/pedidos/types/pedido'

const COLORES: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-900 ring-amber-300',
  EN_PREPARACION: 'bg-sky-100 text-sky-900 ring-sky-300',
  ENTREGADO: 'bg-emerald-100 text-emerald-900 ring-emerald-300',
  CANCELADO: 'bg-stone-200 text-stone-700 ring-stone-300',
}

export default function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 text-xs font-medium uppercase tracking-wider ring-1 ring-inset ${COLORES[estado]}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {NOMBRE_ESTADO[estado]}
    </span>
  )
}
