import { formatearPrecio } from '../../../shared/utils/formato'
import Button from '../../../shared/ui/Button'
import { useCartStore } from '../../../store/cartStore'
import type { Producto } from '../types/producto'
import ImagenProducto from './ImagenProducto'

interface ProductoCardProps {
  producto: Producto
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)

  const sinStock = producto.stock <= 0
  const comprable = producto.disponible && !sinStock
  // Ayuda de interfaz: la validación definitiva del stock la hace el backend al confirmar.
  const alcanzoElStock = enCarrito >= producto.stock

  let etiqueta: { texto: string; clase: string } | null = null
  if (!producto.disponible) etiqueta = { texto: 'No disponible', clase: 'bg-stone-700 text-white' }
  else if (sinStock) etiqueta = { texto: 'Sin stock', clase: 'bg-ladrillo text-white' }
  else if (producto.stock <= 5) etiqueta = { texto: `Quedan ${producto.stock}`, clase: 'bg-amber-400 text-tinta' }

  return (
    <article className="group flex flex-col border border-tinta/10 bg-white transition-shadow hover:shadow-[6px_6px_0_rgb(0_0_0/0.08)]">
      <div className="relative overflow-hidden">
        <ImagenProducto
          url={producto.imagen_url}
          nombre={producto.nombre}
          className={`aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-[1.03] ${comprable ? '' : 'grayscale-[60%]'}`}
        />
        {etiqueta && (
          <span className={`absolute left-3 top-3 px-2 py-1 text-xs font-medium uppercase tracking-wider ${etiqueta.clase}`}>
            {etiqueta.texto}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-turquesa-oscuro">{producto.categoria.nombre}</p>
        <h2 className="mt-1 border-b border-tinta pb-1 text-xl font-medium leading-snug">{producto.nombre}</h2>
        {producto.descripcion && <p className="mt-2 line-clamp-2 text-sm text-tinta/70">{producto.descripcion}</p>}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="text-xl font-medium">{formatearPrecio(producto.precio_base)}</p>
          {enCarrito > 0 && <p className="text-xs text-tinta/60">{enCarrito} en el carrito</p>}
        </div>

        <Button
          variante={comprable ? 'primario' : 'secundario'}
          className="mt-3 w-full"
          disabled={!comprable || alcanzoElStock}
          onClick={() => agregar(producto)}
        >
          {!comprable ? 'No se puede comprar' : alcanzoElStock ? 'Stock máximo en carrito' : 'Agregar al carrito'}
        </Button>
      </div>
    </article>
  )
}
