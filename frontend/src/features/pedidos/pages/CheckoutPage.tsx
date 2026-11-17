import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EncabezadoPagina } from '../../../shared/layout/MainLayout'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCartStore } from '../../../store/cartStore'
import CheckoutForm, { type DatosCheckout } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/usePedidos'

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  if (items.length === 0 && !crearPedido.isSuccess) return <Navigate to="/carrito" replace />

  async function confirmar(datos: DatosCheckout) {
    setErrorServidor(null)
    try {
      // Solo se envían ids y cantidades: el servidor fija precios, valida stock y calcula el total.
      const pedido = await crearPedido.mutateAsync({
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: datos.forma_pago,
        direccion_entrega: datos.direccion_entrega.trim(),
        notas: datos.notas.trim() || null,
      })
      vaciar() // recién ahora, cuando la API confirmó el pedido
      navigate('/mis-pedidos', { replace: true, state: { pedidoCreado: pedido.id } })
    } catch (error) {
      setErrorServidor(handleApiError(error, 'No se pudo crear el pedido.'))
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <EncabezadoPagina titulo="Confirmar pedido" descripcion="Indicá dónde lo entregamos y cómo vas a pagar." />

      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        <section aria-label="Datos de entrega">
          <CheckoutForm onConfirmar={confirmar} errorServidor={errorServidor} />
        </section>

        <aside className="h-fit bg-crema p-6" aria-label="Resumen del pedido">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-[0.18em] text-tinta/70">Tu pedido</h2>
            <Link to="/carrito" className="text-xs uppercase tracking-wider underline-offset-4 hover:underline">
              Editar
            </Link>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between gap-4">
                <span>
                  {i.cantidad} × {i.nombre}
                </span>
                <span className="tabular-nums">{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-tinta/20 pt-3 text-lg font-medium">
            <span>Total estimado</span>
            <span className="tabular-nums">{formatearPrecio(total)}</span>
          </div>
          <p className="mt-3 text-xs text-tinta/60">
            El total final lo calcula el servidor con los precios vigentes al confirmar.
          </p>
        </aside>
      </div>
    </div>
  )
}
