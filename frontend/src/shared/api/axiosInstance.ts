import axios, { AxiosError } from 'axios'

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

/** Cliente HTTP único. withCredentials hace que el navegador adjunte la cookie HttpOnly. */
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Los errores de estas rutas son esperables (credenciales incorrectas, sin sesión al iniciar)
// y los maneja quien las llama: no deben cerrar la sesión desde el interceptor.
const RUTAS_SIN_INTERCEPTAR = ['/auth/token', '/auth/me']

let alInvalidarSesion: (() => void) | null = null

/** El authStore registra aquí cómo limpiar la sesión (evita una importación circular). */
export function registrarSesionInvalida(manejador: () => void): void {
  alInvalidarSesion = manejador
}

function detalleDe(error: AxiosError): unknown {
  const datos = error.response?.data
  return typeof datos === 'object' && datos !== null && 'detail' in datos ? datos.detail : undefined
}

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (error instanceof AxiosError && error.response) {
      const url = error.config?.url ?? ''
      const esperado = RUTAS_SIN_INTERCEPTAR.some((ruta) => url.endsWith(ruta))
      const estado = error.response.status
      const desactivada = estado === 400 && detalleDe(error) === CUENTA_DESACTIVADA

      // 401: sesión vencida o inválida. 400 «Cuenta desactivada»: el admin dio de baja al usuario.
      // Al limpiar el authStore, ProtectedRoute redirige a /login.
      if (!esperado && (estado === 401 || desactivada)) {
        alInvalidarSesion?.()
      }
    }
    return Promise.reject(error)
  },
)
