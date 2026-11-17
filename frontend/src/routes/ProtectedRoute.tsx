import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Rol } from '../features/usuarios/types/usuario'
import { Spinner } from '../shared/ui/Button'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  /** Si se indica, además de la sesión exige uno de estos roles. */
  roles?: Rol[]
}

/**
 * Mejora de experiencia: oculta pantallas que el usuario no puede usar.
 * La autorización real la hace el backend con get_current_active_user y require_role.
 */
export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const location = useLocation()

  if (cargando) {
    return (
      <div role="status" className="flex items-center justify-center gap-3 py-24 text-tinta/70">
        <Spinner /> Verificando la sesión…
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }

  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
