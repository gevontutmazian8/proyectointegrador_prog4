import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EstadoVacio from '../../../shared/components/EstadoVacio'
import { EncabezadoPagina } from '../../../shared/layout/MainLayout'
import Button from '../../../shared/ui/Button'
import Modal from '../../../shared/ui/Modal'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCartStore } from '../../../store/cartStore'
import ItemCarritoFila from '../components/ItemCarritoFila'

export default function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const navigate = useNavigate()
  const [confirmarVaciar, setConfirmarVaciar] = useState(false)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <EncabezadoPagina titulo="Carrito" descripcion="Revisá tu pedido antes de confirmarlo." />

      {items.length === 0 ? (
        <EstadoVacio
          titulo="Tu carrito está vacío"
          descripcion="Agregá productos desde el catálogo."
          accion={
            <Link
              to="/"
              className="bg-carbon px-5 py-2.5 text-sm uppercase tracking-[0.12em] text-white hover:bg-turquesa-oscuro"
            >
              Ver catálogo
            </Link>
          }
        />
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          <section aria-label="Productos del carrito">
            <ul className="divide-y divide-tinta/10 border-y border-tinta/10">
              {items.map((item) => (
                <ItemCarritoFila key={item.producto_id} item={item} />
              ))}
            </ul>
            <div className="mt-4 flex justify-between">
              <Link to="/" className="text-sm uppercase tracking-[0.12em] underline-offset-4 hover:underline">
                ← Seguir comprando
              </Link>
              <Button variante="peligro" tamano="sm" onClick={() => setConfirmarVaciar(true)}>
                Vaciar carrito
              </Button>
            </div>
          </section>

          <aside className="h-fit bg-crema p-6">
            <h2 className="text-sm uppercase tracking-[0.18em] text-tinta/70">Resumen</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Productos</dt>
                <dd>{items.reduce((s, i) => s + i.cantidad, 0)} u.</dd>
              </div>
              <div className="flex justify-between border-t border-tinta/20 pt-3 text-lg font-medium">
                <dt>Total</dt>
                <dd>{formatearPrecio(total)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-tinta/60">
              Los precios y el stock se confirman al crear el pedido.
            </p>
            <Button className="mt-6 w-full" onClick={() => navigate('/checkout')}>
              Continuar al pago
            </Button>
          </aside>
        </div>
      )}

      <Modal abierto={confirmarVaciar} titulo="Vaciar carrito" onCerrar={() => setConfirmarVaciar(false)}>
        <p className="text-tinta/80">Se quitarán todos los productos del carrito.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variante="secundario" onClick={() => setConfirmarVaciar(false)}>
            Cancelar
          </Button>
          <Button
            variante="peligro"
            onClick={() => {
              vaciar()
              setConfirmarVaciar(false)
            }}
          >
            Vaciar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
