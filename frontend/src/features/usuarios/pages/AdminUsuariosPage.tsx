import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import EstadoError from '../../../shared/components/EstadoError'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import TablaDatos from '../../../shared/components/TablaDatos'
import { EncabezadoPagina } from '../../../shared/layout/MainLayout'
import Button from '../../../shared/ui/Button'
import { formatearFecha } from '../../../shared/utils/formato'
import { useAuthStore } from '../../../store/authStore'
import { useCambiarEstadoUsuario, useUsuarios } from '../hooks/useUsuarios'
import type { Usuario } from '../types/usuario'

export default function AdminUsuariosPage() {
  const usuarios = useUsuarios()
  const cambiarEstado = useCambiarEstadoUsuario()
  const actual = useAuthStore((s) => s.usuario)
  const procesandoId = cambiarEstado.isPending ? cambiarEstado.variables.id : null

  const columnas = useMemo<ColumnDef<Usuario>[]>(
    () => [
      {
        id: 'username',
        header: 'Usuario',
        accessorFn: (u) => u.username,
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.username}
            {row.original.id === actual?.id && <span className="ml-2 text-xs text-tinta/50">(vos)</span>}
          </span>
        ),
      },
      { id: 'nombre', header: 'Nombre', accessorFn: (u) => u.full_name },
      { id: 'email', header: 'Email', accessorFn: (u) => u.email },
      {
        id: 'rol',
        header: 'Rol',
        accessorFn: (u) => u.role,
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 text-xs uppercase tracking-wider ${row.original.role === 'admin' ? 'bg-carbon text-white' : 'bg-crema text-tinta'}`}
          >
            {row.original.role === 'admin' ? 'Admin' : 'Cliente'}
          </span>
        ),
      },
      {
        id: 'estado',
        header: 'Estado',
        accessorFn: (u) => (u.disabled ? 'Inactivo' : 'Activo'),
        cell: ({ row }) => (
          <span className={`inline-flex items-center gap-1.5 text-sm ${row.original.disabled ? 'text-ladrillo' : 'text-emerald-700'}`}>
            <span aria-hidden="true" className={`h-2 w-2 rounded-full ${row.original.disabled ? 'bg-ladrillo' : 'bg-emerald-500'}`} />
            {row.original.disabled ? 'Inactivo' : 'Activo'}
          </span>
        ),
      },
      { id: 'alta', header: 'Alta', accessorFn: (u) => u.created_at, cell: ({ row }) => formatearFecha(row.original.created_at) },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => {
          const u = row.original
          if (!u.disabled && u.id === actual?.id) return <span className="text-xs text-tinta/40">—</span>
          return (
            <Button
              variante={u.disabled ? 'acento' : 'peligro'}
              tamano="sm"
              cargando={procesandoId === u.id}
              disabled={procesandoId !== null}
              onClick={() => cambiarEstado.mutate({ id: u.id, activar: u.disabled })}
            >
              {u.disabled ? 'Activar' : 'Desactivar'}
            </Button>
          )
        },
      },
    ],
    [actual?.id, procesandoId],
  )

  return (
    <>
      <EncabezadoPagina titulo="Usuarios" descripcion="Activá o desactivá cuentas de clientes y administradores." />

      {cambiarEstado.isError && (
        <p role="alert" className="mb-4 border-l-4 border-ladrillo bg-red-50 px-4 py-2 text-sm text-ladrillo">
          {handleApiError(cambiarEstado.error)}
        </p>
      )}

      {usuarios.isPending ? (
        <SkeletonFilas />
      ) : usuarios.isError ? (
        <EstadoError error={usuarios.error} onReintentar={() => void usuarios.refetch()} />
      ) : (
        <TablaDatos datos={usuarios.data} columnas={columnas} placeholderBusqueda="Buscar por usuario, nombre o email…" />
      )}
    </>
  )
}
