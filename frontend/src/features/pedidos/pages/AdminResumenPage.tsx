import EstadoError from '../../../shared/components/EstadoError'
import Skeleton from '../../../shared/components/Skeleton'
import { EncabezadoPagina } from '../../../shared/layout/MainLayout'
import Button from '../../../shared/ui/Button'
import { formatearPrecio } from '../../../shared/utils/formato'
import TarjetaResumen from '../components/TarjetaResumen'
import { useResumenPedidos } from '../hooks/usePedidos'

export default function AdminResumenPage() {
  const resumen = useResumenPedidos()

  return (
    <>
      <EncabezadoPagina
        titulo="Resumen"
        descripcion="Indicadores del negocio en tiempo real."
        acciones={
          <Button variante="secundario" tamano="sm" cargando={resumen.isFetching} onClick={() => void resumen.refetch()}>
            Actualizar
          </Button>
        }
      />

      {resumen.isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : resumen.isError ? (
        <EstadoError error={resumen.error} onReintentar={() => void resumen.refetch()} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen titulo="Pendientes" valor={String(resumen.data.pendientes)} detalle="Esperan preparación" acento="bg-amber-400" />
          <TarjetaResumen titulo="En preparación" valor={String(resumen.data.en_preparacion)} detalle="En cocina" acento="bg-sky-500" />
          <TarjetaResumen titulo="Entregados" valor={String(resumen.data.entregados)} detalle="Completados" acento="bg-emerald-500" />
          <TarjetaResumen titulo="Cancelados" valor={String(resumen.data.cancelados)} detalle="Stock restituido" acento="bg-stone-400" />
          <TarjetaResumen titulo="Pedidos de hoy" valor={String(resumen.data.pedidos_hoy)} detalle="Creados desde las 00:00" acento="bg-naranja" />
          <TarjetaResumen
            titulo="Ingresos entregados"
            valor={formatearPrecio(resumen.data.ingresos_entregados)}
            detalle="Suma de pedidos entregados"
            acento="bg-carbon"
          />
        </div>
      )}
    </>
  )
}
