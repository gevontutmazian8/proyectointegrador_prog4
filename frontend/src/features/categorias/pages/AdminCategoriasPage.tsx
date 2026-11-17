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
import CategoriaForm from '../components/CategoriaForm'
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '../hooks/useCategorias'
import type { Categoria, CategoriaPayload } from '../types/categoria'

type Edicion = { modo: 'crear' } | { modo: 'editar'; categoria: Categoria }

export default function AdminCategoriasPage() {
  const categorias = useCategorias()
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const eliminar = useEliminarCategoria()
  const [edicion, setEdicion] = useState<Edicion | null>(null)
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null)
  const [errorForm, setErrorForm] = useState<string | null>(null)

  function abrir(nueva: Edicion) {
    setErrorForm(null)
    setEdicion(nueva)
  }

  async function guardar(payload: CategoriaPayload) {
    setErrorForm(null)
    try {
      if (edicion?.modo === 'editar') await actualizar.mutateAsync({ id: edicion.categoria.id, payload })
      else await crear.mutateAsync(payload)
      setEdicion(null)
    } catch (error) {
      setErrorForm(handleApiError(error, 'No se pudo guardar la categoría.'))
    }
  }

  async function confirmarBaja() {
    if (!aEliminar) return
    try {
      await eliminar.mutateAsync(aEliminar.id)
      setAEliminar(null)
    } catch {
      // Se muestra en el diálogo.
    }
  }

  const columnas = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { id: 'nombre', header: 'Nombre', accessorFn: (c) => c.nombre, cell: ({ row }) => <span className="font-medium">{row.original.nombre}</span> },
      {
        id: 'descripcion',
        header: 'Descripción',
        accessorFn: (c) => c.descripcion ?? '',
        cell: ({ row }) => <span className="text-tinta/70">{row.original.descripcion ?? '—'}</span>,
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variante="secundario" tamano="sm" onClick={() => abrir({ modo: 'editar', categoria: row.original })}>
              Editar
            </Button>
            <Button
              variante="peligro"
              tamano="sm"
              onClick={() => {
                eliminar.reset()
                setAEliminar(row.original)
              }}
            >
              Dar de baja
            </Button>
          </div>
        ),
      },
    ],
    [eliminar],
  )

  return (
    <>
      <EncabezadoPagina
        titulo="Categorías"
        descripcion="Agrupan los productos del catálogo."
        acciones={<Button onClick={() => abrir({ modo: 'crear' })}>+ Nueva categoría</Button>}
      />

      {categorias.isPending ? (
        <SkeletonFilas />
      ) : categorias.isError ? (
        <EstadoError error={categorias.error} onReintentar={() => void categorias.refetch()} />
      ) : (
        <TablaDatos
          datos={categorias.data}
          columnas={columnas}
          placeholderBusqueda="Buscar categoría…"
          mensajeVacio="No hay categorías activas."
        />
      )}

      <Modal
        abierto={edicion !== null}
        titulo={edicion?.modo === 'editar' ? 'Editar categoría' : 'Nueva categoría'}
        onCerrar={() => setEdicion(null)}
      >
        {edicion && (
          <CategoriaForm
            key={edicion.modo === 'editar' ? edicion.categoria.id : 'nueva'}
            categoria={edicion.modo === 'editar' ? edicion.categoria : null}
            errorServidor={errorForm}
            onGuardar={guardar}
            onCancelar={() => setEdicion(null)}
          />
        )}
      </Modal>

      <ConfirmarAccion
        abierto={aEliminar !== null}
        titulo="Dar de baja categoría"
        mensaje={
          <>
            La categoría <strong>{aEliminar?.nombre}</strong> dejará de listarse. Sus productos siguen a la venta y el
            nombre no se libera.
          </>
        }
        textoConfirmar="Dar de baja"
        peligro
        procesando={eliminar.isPending}
        error={eliminar.isError ? handleApiError(eliminar.error) : null}
        onConfirmar={() => void confirmarBaja()}
        onCancelar={() => setAEliminar(null)}
      />
    </>
  )
}
