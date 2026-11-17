import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { cerrarSesion, iniciarSesion, obtenerPerfil } from '../features/auth/api/auth'
import type { Credenciales } from '../features/auth/types/auth'
import type { Usuario } from '../features/usuarios/types/usuario'
import { registrarSesionInvalida } from '../shared/api/axiosInstance'

interface AuthState {
  usuario: Usuario | null
  /** true mientras checkSession confirma la sesión con /auth/me al iniciar la app. */
  cargando: boolean
  login: (credenciales: Credenciales) => Promise<Usuario>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiar: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      async login(credenciales) {
        await iniciarSesion(credenciales) // el navegador guarda la cookie HttpOnly
        const usuario = await obtenerPerfil()
        set({ usuario, cargando: false })
        return usuario
      },

      async logout() {
        try {
          await cerrarSesion()
        } finally {
          set({ usuario: null })
        }
      },

      async checkSession() {
        set({ cargando: true })
        try {
          set({ usuario: await obtenerPerfil() })
        } catch {
          set({ usuario: null })
        } finally {
          set({ cargando: false })
        }
      },

      limpiar() {
        set({ usuario: null })
      },
    }),
    {
      name: 'foodstore-auth',
      storage: createJSONStorage(() => localStorage),
      // Solo se persiste el usuario (nombre, email y rol). El JWT nunca pasa por JavaScript.
      partialize: (estado) => ({ usuario: estado.usuario }),
    },
  ),
)

// El interceptor de Axios limpia la sesión ante un 401 o una cuenta desactivada.
registrarSesionInvalida(() => useAuthStore.getState().limpiar())
