import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import Button from '../../../shared/ui/Button'
import Input, { Campo, errorDeCampo } from '../../../shared/ui/Input'
import { useAuthStore } from '../../../store/authStore'
import AuthCard from '../components/AuthCard'

interface EstadoNavegacion {
  desde?: string
  registrado?: string
}

export default function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const usuario = useAuthStore((s) => s.usuario)
  const navigate = useNavigate()
  const location = useLocation()
  const estado = (location.state ?? {}) as EstadoNavegacion
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: estado.registrado ?? '', password: '' },
    onSubmit: async ({ value }) => {
      setErrorServidor(null)
      try {
        const actual = await login({ username: value.username.trim(), password: value.password })
        const destino = estado.desde ?? (actual.role === 'admin' ? '/admin/resumen' : '/')
        navigate(destino, { replace: true })
      } catch (error) {
        setErrorServidor(handleApiError(error, 'No se pudo iniciar sesión.'))
      }
    },
  })

  if (usuario) return <Navigate to="/" replace />

  return (
    <AuthCard
      titulo="Ingresar"
      subtitulo="Accedé para confirmar pedidos y seguir su estado."
      pie={
        <>
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-naranja-oscuro underline-offset-4 hover:underline">
            Registrate
          </Link>
        </>
      }
    >
      {estado.registrado && !errorServidor && (
        <p className="mb-6 border-l-4 border-naranja bg-naranja/10 px-4 py-2 text-sm text-naranja-oscuro">
          Cuenta creada. Ingresá con tu contraseña.
        </p>
      )}
      <form
        noValidate
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="username"
          validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu usuario') }}
        >
          {(field) => (
            <Campo id="username" label="Usuario" error={errorDeCampo(field.state.meta)}>
              <Input
                id="username"
                autoComplete="username"
                autoFocus
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={errorDeCampo(field.state.meta)}
              />
            </Campo>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{ onChange: ({ value }) => (value ? undefined : 'Ingresá tu contraseña') }}
        >
          {(field) => (
            <Campo id="password" label="Contraseña" error={errorDeCampo(field.state.meta)}>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={errorDeCampo(field.state.meta)}
              />
            </Campo>
          )}
        </form.Field>

        {errorServidor && (
          <p role="alert" className="border-l-4 border-ladrillo bg-red-50 px-4 py-2 text-sm text-ladrillo">
            {errorServidor}
          </p>
        )}

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(enviando) => (
            <Button type="submit" className="w-full" cargando={enviando}>
              {enviando ? 'Ingresando…' : 'Ingresar'}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthCard>
  )
}
