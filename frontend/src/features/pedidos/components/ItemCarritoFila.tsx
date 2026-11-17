import { formatearPrecio } from '../../../shared/utils/formato'
import { useCartStore, type ItemCarrito } from '../../../store/cartStore'

const BOTON =
  'flex h-9 w-9 items-center justify-center border border-tinta/25 text-lg transition-colors hover:border-tinta hover:bg-arena'

export default function ItemCarritoFila({ item }: { item: ItemCarrito }) {
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)

  return (
    <li className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="text-lg font-medium">{item.nombre}</p>
        <p className="text-sm text-tinta/60">{formatearPrecio(item.precio_unitario)} c/u</p>
      </div>

      <div className="flex items-center gap-1" role="group" aria-label={`Cantidad de ${item.nombre}`}>
        <button
          type="button"
          className={BOTON}
          aria-label="Restar uno"
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
        >
          −
        </button>
        <span className="w-10 text-center tabular-nums" aria-live="polite">
          {item.cantidad}
        </span>
        <button
          type="button"
          className={BOTON}
          aria-label="Sumar uno"
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
        >
          +
        </button>
      </div>

      <p className="w-32 text-right text-lg font-medium tabular-nums">
        {formatearPrecio(item.precio_unitario * item.cantidad)}
      </p>

      <button
        type="button"
        onClick={() => quitar(item.producto_id)}
        className="text-sm uppercase tracking-[0.12em] text-ladrillo underline-offset-4 hover:underline"
      >
        Quitar
      </button>
    </li>
  )
}
