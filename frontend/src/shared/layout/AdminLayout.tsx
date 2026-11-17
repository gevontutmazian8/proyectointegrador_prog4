import { NavLink, Outlet } from 'react-router-dom'

const SECCIONES = [
  { ruta: '/admin/resumen', nombre: 'Resumen' },
  { ruta: '/admin/pedidos', nombre: 'Pedidos' },
  { ruta: '/admin/productos', nombre: 'Productos' },
  { ruta: '/admin/categorias', nombre: 'Categorías' },
  { ruta: '/admin/usuarios', nombre: 'Usuarios' },
]

/** Pestañas del panel de administración sobre la franja crema. */
export default function AdminLayout() {
  return (
    <div>
      <div className="border-b border-tinta/10 bg-crema">
        <nav aria-label="Panel de administración" className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
          {SECCIONES.map((s) => (
            <NavLink
              key={s.ruta}
              to={s.ruta}
              className={({ isActive }) =>
                `whitespace-nowrap border-b-2 px-4 py-3 text-sm uppercase tracking-[0.12em] transition-colors ${isActive ? 'border-turquesa-oscuro text-tinta' : 'border-transparent text-tinta/60 hover:text-tinta'}`
              }
            >
              {s.nombre}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Outlet />
      </div>
    </div>
  )
}
