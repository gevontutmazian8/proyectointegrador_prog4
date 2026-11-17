import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCantidadEnCarrito } from '../../store/cartStore'

function claseEnlace({ isActive }: { isActive: boolean }): string {
  return `block px-1 py-1 text-sm uppercase tracking-[0.14em] underline-offset-8 transition-colors hover:text-turquesa ${isActive ? 'text-turquesa underline decoration-2' : 'text-white/85'}`
}

export default function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidad = useCantidadEnCarrito()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [saliendo, setSaliendo] = useState(false)

  async function cerrarSesion() {
    setSaliendo(true)
    try {
      await logout()
    } finally {
      queryClient.clear() // no dejar en caché datos del usuario anterior
      setSaliendo(false)
      setMenuAbierto(false)
      navigate('/login')
    }
  }

  const cerrarMenu = () => setMenuAbierto(false)

  return (
    <header className="sticky top-0 z-40 bg-carbon text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <Link to="/" onClick={cerrarMenu} className="leading-none">
          <span className="block text-2xl font-medium tracking-[0.08em]">FOOD STORE</span>
          <span className="mt-1 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-white/70">
            <span aria-hidden="true" className="h-px w-5 bg-white/60" />
            Pedidos
            <span aria-hidden="true" className="h-px w-5 bg-white/60" />
          </span>
        </Link>

        <button
          type="button"
          className="border border-white/50 px-3 py-1.5 text-xs uppercase tracking-widest md:hidden"
          aria-expanded={menuAbierto}
          aria-controls="menu-principal"
          onClick={() => setMenuAbierto((v) => !v)}
        >
          {menuAbierto ? 'Cerrar' : 'Menú'}
        </button>

        <nav
          id="menu-principal"
          aria-label="Principal"
          className={`${menuAbierto ? 'flex' : 'hidden'} absolute inset-x-0 top-full flex-col gap-4 border-t border-white/10 bg-carbon px-4 py-5 md:static md:flex md:flex-row md:items-center md:gap-6 md:border-0 md:p-0`}
        >
          <NavLink to="/" end className={claseEnlace} onClick={cerrarMenu}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={claseEnlace} onClick={cerrarMenu}>
            Carrito
            {cantidad > 0 && (
              <span className="ml-2 inline-flex min-w-5 items-center justify-center bg-turquesa px-1.5 text-xs font-semibold text-white">
                {cantidad}
              </span>
            )}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={claseEnlace} onClick={cerrarMenu}>
              Mis pedidos
            </NavLink>
          )}
          {usuario?.role === 'admin' && (
            <NavLink to="/admin" className={claseEnlace} onClick={cerrarMenu}>
              Panel
            </NavLink>
          )}

          <div className="flex flex-wrap items-center gap-4 border-t border-white/15 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            {usuario ? (
              <>
                <span className="text-sm leading-tight">
                  <span className="block font-medium">{usuario.full_name}</span>
                  <span className="text-xs uppercase tracking-wider text-white/60">
                    {usuario.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={cerrarSesion}
                  disabled={saliendo}
                  className="border border-white/60 px-3 py-1.5 text-xs uppercase tracking-widest transition-colors hover:border-turquesa hover:bg-turquesa disabled:opacity-50"
                >
                  {saliendo ? 'Saliendo…' : 'Cerrar sesión'}
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={claseEnlace} onClick={cerrarMenu}>
                  Ingresar
                </NavLink>
                <Link
                  to="/register"
                  onClick={cerrarMenu}
                  className="bg-turquesa px-3 py-1.5 text-xs uppercase tracking-widest transition-colors hover:bg-turquesa-oscuro"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
