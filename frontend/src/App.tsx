import { useEffect } from 'react'
import AppRouter from './routes/AppRouter'
import { useAuthStore } from './store/authStore'

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  // Única llamada en un useEffect: confirmar con /auth/me si la cookie sigue siendo válida.
  useEffect(() => {
    void checkSession()
  }, [checkSession])

  return <AppRouter />
}
