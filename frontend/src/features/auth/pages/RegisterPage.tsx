import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import Button from '../../../shared/ui/Button'
import Input, { Campo, errorDeCampo } from '../../../shared/ui/Input'
import { useAuthStore } from '../../../store/authStore'
import { registrarUsuario } from '../api/auth'
import AuthCard from '../components/AuthCard'
import type { RegistroPayload } from '../types/auth'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const navigate = useNavigate()
  const registro = useMutation({ mutationFn: (payload: RegistroPayload) => registrarUsuario(payload) })

  const form = useForm({
    defaultValues: { full_name: '', username: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      try {
        const creado = await registro.mutateAsync({
          full_name: value.full_name.trim(),
          username: value.username.trim(),
          email: value.email.trim(),
          password: value.password,
        })
        navigate('/login', { state: { registrado: creado.username } })
      } catch {
        // El mensaje se muestra a partir de registro.error.
      }
    },
  })

  if (usuario) return <Navigate to="/" replace />

  return (
    <AuthCard
      titulo="Crear cuenta"
      subtitulo="Registrate para hacer tu primer pedido."
      pie={
        <>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-turquesa-oscuro underline-offset-4 hover:underline">
            Ingresá
          </Link>
        </>
      }
    >
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
          name="full_name"
          validators={{
            onChange: ({ value }) =>
              value.trim().length < 2 ? 'Ingresá tu nombre completo (mínimo 2 caracteres)' : undefined,
          }}
        >
          {(field) => (
            <Campo id="full_name" label="Nombre completo" error={errorDeCampo(field.state.meta)}>
              <Input
                id="full_name"
                autoComplete="name"
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
          name="username"
          validators={{
            onChange: ({ value }) => {
              const limpio = value.trim()
              if (limpio.length < 3) return 'Mínimo 3 caracteres'
              if (limpio.length > 50) return 'Máximo 50 caracteres'
              return undefined
            },
          }}
        >
          {(field) => (
            <Campo id="username" label="Usuario" error={errorDeCampo(field.state.meta)}>
              <Input
                id="username"
                autoComplete="username"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={errorDeCampo(field.state.meta)}
              />
            </Campo>
          )}
        </form.Field>

        <form.Field
          name="email"
          validators={{ onChange: ({ value }) => (EMAIL.test(value.trim()) ? undefined : 'Ingresá un email válido') }}
        >
          {(field) => (
            <Campo id="email" label="Email" error={errorDeCampo(field.state.meta)}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
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
          validators={{
            onChange: ({ value }) => {
              if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
              if (value.length > 72) return 'Máximo 72 caracteres'
              return undefined
            },
          }}
        >
          {(field) => (
            <Campo
              id="password"
              label="Contraseña"
              ayuda="Mínimo 8 caracteres."
              error={errorDeCampo(field.state.meta)}
            >
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={errorDeCampo(field.state.meta)}
              />
            </Campo>
          )}
        </form.Field>

        {registro.isError && (
          <p role="alert" className="border-l-4 border-ladrillo bg-red-50 px-4 py-2 text-sm text-ladrillo">
            {handleApiError(registro.error, 'No se pudo crear la cuenta.')}
          </p>
        )}

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(enviando) => (
            <Button type="submit" className="w-full" cargando={enviando}>
              {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthCard>
  )
}
