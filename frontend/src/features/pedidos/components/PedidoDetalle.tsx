import BadgeEstado from '../../../shared/ui/BadgeEstado'
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato'
import type { Pedido } from '../types/pedido'

/** Detalle de un pedido: datos de entrega y líneas con el precio copiado al crearlo. */
export default function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BadgeEstado estado={pedido.estado} />
        <p className="text-sm text-tinta/60">Creado el {formatearFecha(pedido.created_at)}</p>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-tinta/60">Dirección de entrega</dt>
          <dd>{pedido.direccion_entrega}</dd>
        </div>
        <div>
          <dt className="text-tinta/60">Forma de pago</dt>
          <dd>{pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</dd>
        </div>
        {pedido.notas && (
          <div className="sm:col-span-2">
            <dt className="text-tinta/60">Notas</dt>
            <dd>{pedido.notas}</dd>
          </div>
        )}
        <div className="sm:col-span-2">
          <dt className="text-tinta/60">Última actualización</dt>
          <dd>{formatearFecha(pedido.updated_at)}</dd>
        </div>
      </dl>

      <table className="w-full text-sm">
        <caption className="sr-only">Productos del pedido</caption>
        <thead>
          <tr className="border-b border-tinta text-left text-xs uppercase tracking-wider text-tinta/60">
            <th scope="col" className="py-2">Producto</th>
            <th scope="col" className="py-2 text-right">Cant.</th>
            <th scope="col" className="py-2 text-right">Precio</th>
            <th scope="col" className="py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {pedido.items.map((d) => (
            <tr key={d.producto_id} className="border-b border-tinta/10">
              <td className="py-2 pr-2">{d.nombre_producto}</td>
              <td className="py-2 text-right tabular-nums">{d.cantidad}</td>
              <td className="py-2 text-right tabular-nums">{formatearPrecio(d.precio_unitario)}</td>
              <td className="py-2 text-right tabular-nums">{formatearPrecio(d.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="text-base font-medium">
            <td colSpan={3} className="pt-3">Total</td>
            <td className="pt-3 text-right tabular-nums">{formatearPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
