import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import ConfirmarAccion from '../../../shared/components/ConfirmarAccion'
import EstadoError from '../../../shared/components/EstadoError'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import TablaDatos from '../../../shared/components/TablaDatos'
import { EncabezadoPagina } from '../../../shared/layout/MainLayout'
import Button from '../../../shared/ui/Button'
import Modal from '../../../shared/ui/Modal'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import ImagenProducto from '../components/ImagenProducto'
import ProductoForm from '../components/ProductoForm'
import StockForm from '../components/StockForm'
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos'
import type { Producto, ProductoPayload, ProductoStockPayload } from '../types/producto'

type Dialogo =
  | { tipo: 'crear' }
  | { tipo: 'editar'; producto: Producto }
  | { tipo: 'stock'; producto: Producto }
  | { tipo: 'baja'; producto: Producto }

export default function AdminProductosPage() {
  // El panel pide limit=100 y pagina del lado del cliente con TanStack Table.
  const productos = useProductos({ skip: 0, limit: 100 })
  const categorias = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const stock = useActualizarStock()
  const eliminar = useEliminarProducto()
  const [dialogo, setDialogo] = useState<Dialogo | null>(null)
  const [errorForm, setErrorForm] = useState<string | null>(null)

  function abrir(nuevo: Dialogo) {
    setErrorForm(null)
    eliminar.reset()
    setDialogo(nuevo)
  }

  async function ejecutar(accion: () => Promise<unknown>, porDefecto: string) {
    setErrorForm(null)
    try {
      await accion()
      setDialogo(null)
    } catch (error) {
      setErrorForm(handleApiError(error, porDefecto))
    }
  }

  const guardarProducto = (payload: ProductoPayload) =>
    ejecutar(
      () =>
        dialogo?.tipo === 'editar'
          ? actualizar.mutateAsync({ id: dialogo.producto.id, payload })
          : crear.mutateAsync(payload),
      'No se pudo guardar el producto.',
    )

  const guardarStock = (payload: ProductoStockPayload) =>
    dialogo?.tipo === 'stock'
      ? ejecutar(() => stock.mutateAsync({ id: dialogo.producto.id, payload }), 'No se pudo actualizar el stock.')
      : Promise.resolve()

  const columnas = useMemo<ColumnDef<Producto>[]>(
    () => [
      {
        id: 'producto',
        header: 'Producto',
        accessorFn: (p) => p.nombre,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <ImagenProducto url={row.original.imagen_url} nombre={row.original.nombre} className="h-10 w-14 shrink-0 text-lg" />
            <span className="font-medium">{row.original.nombre}</span>
          </div>
        ),
      },
      { id: 'categoria', header: 'Categoría', accessorFn: (p) => p.categoria.nombre },
      {
        id: 'precio',
        header: 'Precio',
        accessorFn: (p) => p.precio_base,
        cell: ({ row }) => <span className="tabular-nums">{formatearPrecio(row.original.precio_base)}</span>,
      },
      {
        id: 'stock',
        header: 'Stock',
        accessorFn: (p) => p.stock,
        cell: ({ row }) => (
          <span className={`tabular-nums ${row.original.stock === 0 ? 'font-medium text-ladrillo' : ''}`}>
            {row.original.stock}
          </span>
        ),
      },
      {
        id: 'disponible',
        header: 'Venta',
        accessorFn: (p) => (p.disponible ? 1 : 0),
        cell: ({ row }) => {
          const p = row.original
          return (
            <button
              type="button"
              role="switch"
              aria-checked={p.disponible}
              aria-label={`${p.disponible ? 'Pausar' : 'Habilitar'} la venta de ${p.nombre}`}
              disabled={stock.isPending}
              onClick={() => stock.mutate({ id: p.id, payload: { disponible: !p.disponible } })}
              className={`inline-flex items-center gap-2 px-2 py-1 text-xs uppercase tracking-wider ring-1 ring-inset transition-colors disabled:opacity-50 ${p.disponible ? 'bg-emerald-50 text-emerald-800 ring-emerald-300 hover:bg-emerald-100' : 'bg-stone-100 text-stone-600 ring-stone-300 hover:bg-stone-200'}`}
            >
              <span aria-hidden="true" className={`h-2 w-2 rounded-full ${p.disponible ? 'bg-emerald-500' : 'bg-stone-400'}`} />
              {p.disponible ? 'Disponible' : 'Pausado'}
            </button>
          )
        },
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-2 whitespace-nowrap">
            <Button variante="secundario" tamano="sm" onClick={() => abrir({ tipo: 'editar', producto: row.original })}>
              Editar
            </Button>
            <Button variante="secundario" tamano="sm" onClick={() => abrir({ tipo: 'stock', producto: row.original })}>
              Stock
            </Button>
            <Button variante="peligro" tamano="sm" onClick={() => abrir({ tipo: 'baja', producto: row.original })}>
              Baja
            </Button>
          </div>
        ),
      },
    ],
    [stock.isPending],
  )

  return (
    <>
      <EncabezadoPagina
        titulo="Productos"
        descripcion="Precios, stock y disponibilidad del catálogo."
        acciones={<Button onClick={() => abrir({ tipo: 'crear' })}>+ Nuevo producto</Button>}
      />

      {stock.isError && !dialogo && (
        <p role="alert" className="mb-4 border-l-4 border-ladrillo bg-red-50 px-4 py-2 text-sm text-ladrillo">
          {handleApiError(stock.error)}
        </p>
      )}

      {productos.isPending ? (
        <SkeletonFilas />
      ) : productos.isError ? (
        <EstadoError error={productos.error} onReintentar={() => void productos.refetch()} />
      ) : (
        <TablaDatos
          datos={productos.data.items}
          columnas={columnas}
          placeholderBusqueda="Buscar producto o categoría…"
          mensajeVacio="No hay productos activos."
        />
      )}

      <Modal
        abierto={dialogo?.tipo === 'crear' || dialogo?.tipo === 'editar'}
        titulo={dialogo?.tipo === 'editar' ? 'Editar producto' : 'Nuevo producto'}
        onCerrar={() => setDialogo(null)}
        ancho="lg"
      >
        {(dialogo?.tipo === 'crear' || dialogo?.tipo === 'editar') && (
          <ProductoForm
            key={dialogo.tipo === 'editar' ? dialogo.producto.id : 'nuevo'}
            producto={dialogo.tipo === 'editar' ? dialogo.producto : null}
            categorias={categorias.data ?? []}
            errorServidor={errorForm}
            onGuardar={guardarProducto}
            onCancelar={() => setDialogo(null)}
          />
        )}
      </Modal>

      <Modal abierto={dialogo?.tipo === 'stock'} titulo="Actualizar stock" onCerrar={() => setDialogo(null)}>
        {dialogo?.tipo === 'stock' && (
          <StockForm
            key={dialogo.producto.id}
            producto={dialogo.producto}
            errorServidor={errorForm}
            onGuardar={guardarStock}
            onCancelar={() => setDialogo(null)}
          />
        )}
      </Modal>

      <ConfirmarAccion
        abierto={dialogo?.tipo === 'baja'}
        titulo="Dar de baja producto"
        mensaje={
          dialogo?.tipo === 'baja' && (
            <>
              <strong>{dialogo.producto.nombre}</strong> dejará de mostrarse en el catálogo y no se podrá comprar. Los
              pedidos anteriores conservan su detalle.
            </>
          )
        }
        textoConfirmar="Dar de baja"
        peligro
        procesando={eliminar.isPending}
        error={eliminar.isError ? handleApiError(eliminar.error) : null}
        onConfirmar={() => {
          if (dialogo?.tipo === 'baja') eliminar.mutate(dialogo.producto.id, { onSuccess: () => setDialogo(null) })
        }}
        onCancelar={() => setDialogo(null)}
      />
    </>
  )
}
