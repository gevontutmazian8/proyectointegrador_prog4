import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import Input from '../ui/Input'
import Paginacion from './Paginacion'

interface TablaDatosProps<T> {
  datos: T[]
  columnas: ColumnDef<T>[]
  /** Texto del buscador; si se omite, la tabla no muestra búsqueda. */
  placeholderBusqueda?: string
  filasPorPagina?: number
  mensajeVacio?: string
}

/** Tabla del panel con TanStack Table: orden por columna, búsqueda y paginación del lado del cliente. */
export default function TablaDatos<T>({
  datos,
  columnas,
  placeholderBusqueda,
  filasPorPagina = 10,
  mensajeVacio = 'No hay registros para mostrar.',
}: TablaDatosProps<T>) {
  const [orden, setOrden] = useState<SortingState>([])
  const [busqueda, setBusqueda] = useState('')

  const tabla = useReactTable({
    data: datos,
    columns: columnas,
    state: { sorting: orden, globalFilter: busqueda },
    onSortingChange: setOrden,
    onGlobalFilterChange: setBusqueda,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: filasPorPagina } },
  })

  const filas = tabla.getRowModel().rows

  return (
    <div className="space-y-4">
      {placeholderBusqueda && (
        <div className="max-w-sm">
          <Input
            type="search"
            aria-label={placeholderBusqueda}
            placeholder={placeholderBusqueda}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      )}

      <div className="overflow-x-auto border border-tinta/15">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="bg-carbon text-white">
            {tabla.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => {
                  const ordenable = header.column.getCanSort()
                  const sentido = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={sentido === 'asc' ? 'ascending' : sentido === 'desc' ? 'descending' : undefined}
                      className="px-4 py-3 text-xs font-medium uppercase tracking-[0.12em]"
                    >
                      {header.isPlaceholder ? null : ordenable ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 uppercase tracking-[0.12em] hover:text-naranja-oscuro"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span aria-hidden="true" className="text-white/60">
                            {sentido === 'asc' ? '↑' : sentido === 'desc' ? '↓' : '↕'}
                          </span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr>
                <td colSpan={columnas.length} className="px-4 py-10 text-center text-tinta/60">
                  {mensajeVacio}
                </td>
              </tr>
            ) : (
              filas.map((fila) => (
                <tr key={fila.id} className="border-t border-tinta/10 even:bg-arena/60 hover:bg-crema/50">
                  {fila.getVisibleCells().map((celda) => (
                    <td key={celda.id} className="px-4 py-3 align-middle">
                      {flexRender(celda.column.columnDef.cell, celda.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs uppercase tracking-wider text-tinta/60">
          {tabla.getFilteredRowModel().rows.length} registro(s)
        </p>
        <Paginacion
          pagina={tabla.getState().pagination.pageIndex + 1}
          totalPaginas={tabla.getPageCount()}
          onCambiar={(p) => tabla.setPageIndex(p - 1)}
        />
      </div>
    </div>
  )
}
