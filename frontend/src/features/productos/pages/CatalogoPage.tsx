import { useSearchParams } from 'react-router-dom'
import EstadoError from '../../../shared/components/EstadoError'
import EstadoVacio from '../../../shared/components/EstadoVacio'
import Paginacion from '../../../shared/components/Paginacion'
import { SkeletonTarjetas } from '../../../shared/components/Skeleton'
import { EncabezadoPagina } from '../../../shared/layout/MainLayout'
import Button from '../../../shared/ui/Button'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import FiltrosCatalogo from '../components/FiltrosCatalogo'
import ProductoCard from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const POR_PAGINA = 8

export default function CatalogoPage() {
  // Los filtros viven en la URL: se pueden compartir y sobreviven a recargar la página.
  const [params, setParams] = useSearchParams()
  const pagina = Math.max(1, Number(params.get('pagina')) || 1)
  const busqueda = params.get('q') ?? ''
  const categoriaId = params.get('categoria') ? Number(params.get('categoria')) : undefined
  const soloDisponibles = params.get('disponibles') === '1'

  const categorias = useCategorias()
  const productos = useProductos({
    skip: (pagina - 1) * POR_PAGINA, // skip = página × limit
    limit: POR_PAGINA,
    search: busqueda || undefined,
    categoria_id: categoriaId,
    disponible: soloDisponibles ? true : undefined,
  })

  function actualizar(cambios: Record<string, string | undefined>) {
    const nuevos = new URLSearchParams(params)
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor) nuevos.set(clave, valor)
      else nuevos.delete(clave)
    }
    if (!('pagina' in cambios)) nuevos.delete('pagina') // un filtro nuevo vuelve a la página 1
    setParams(nuevos)
  }

  const totalPaginas = productos.data ? Math.ceil(productos.data.total / POR_PAGINA) : 0
  const hayFiltros = Boolean(busqueda || categoriaId || soloDisponibles)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <EncabezadoPagina
        titulo="Catálogo"
        descripcion={
          productos.data ? `${productos.data.total} producto(s) para pedir.` : 'Elegí tus productos y armá el pedido.'
        }
      />

      <FiltrosCatalogo
        key={busqueda}
        busqueda={busqueda}
        categoriaId={categoriaId}
        soloDisponibles={soloDisponibles}
        categorias={categorias.data ?? []}
        onBuscar={(q) => actualizar({ q })}
        onCategoria={(id) => actualizar({ categoria: id?.toString() })}
        onSoloDisponibles={(v) => actualizar({ disponibles: v ? '1' : undefined })}
      />

      {productos.isPending ? (
        <SkeletonTarjetas cantidad={POR_PAGINA} />
      ) : productos.isError ? (
        <EstadoError error={productos.error} onReintentar={() => void productos.refetch()} />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio
          titulo={hayFiltros ? 'No encontramos productos con esos filtros' : 'Todavía no hay productos'}
          descripcion={hayFiltros ? 'Probá con otra búsqueda o categoría.' : 'Volvé más tarde.'}
          accion={
            hayFiltros && (
              <Button variante="secundario" onClick={() => setParams(new URLSearchParams())}>
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-10">
          <div
            className={`grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-4 ${productos.isPlaceholderData ? 'opacity-60' : ''}`}
          >
            {productos.data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion
            pagina={pagina}
            totalPaginas={totalPaginas}
            deshabilitado={productos.isPlaceholderData}
            onCambiar={(p) => {
              actualizar({ pagina: String(p) })
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </div>
      )}
    </div>
  )
}
