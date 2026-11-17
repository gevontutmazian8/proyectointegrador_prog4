import { QueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // No reintentar errores del cliente (401, 403, 404...): solo fallas de red o del servidor.
      retry: (intentos, error) => {
        const estado = error instanceof AxiosError ? error.response?.status : undefined
        if (estado !== undefined && estado < 500) return false
        return intentos < 2
      },
    },
  },
})
