import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const ESTILO_CONTROL =
  'w-full border bg-white px-3 py-2.5 text-sm text-tinta placeholder:text-tinta/40 transition-colors focus:outline-none focus:ring-2 focus:ring-turquesa/30 disabled:bg-arena disabled:text-tinta/50'

function estilo(error?: string): string {
  return `${ESTILO_CONTROL} ${error ? 'border-ladrillo focus:border-ladrillo' : 'border-tinta/25 focus:border-turquesa'}`
}

interface CampoProps {
  id: string
  label: string
  error?: string
  ayuda?: string
  children: ReactNode
}

/** Etiqueta, control y mensaje de error asociados por id (accesible). */
export function Campo({ id, label, error, ayuda, children }: CampoProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm text-tinta/80">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-ladrillo">
          {error}
        </p>
      ) : (
        ayuda && <p className="mt-1 text-xs text-tinta/55">{ayuda}</p>
      )}
    </div>
  )
}

interface ControlProps {
  error?: string
}

export default function Input({ error, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & ControlProps) {
  return (
    <input
      aria-invalid={error ? true : undefined}
      aria-describedby={error && props.id ? `${props.id}-error` : undefined}
      className={`${estilo(error)} ${className}`}
      {...props}
    />
  )
}

export function Select({ error, className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement> & ControlProps) {
  return (
    <select
      aria-invalid={error ? true : undefined}
      aria-describedby={error && props.id ? `${props.id}-error` : undefined}
      className={`${estilo(error)} ${className}`}
      {...props}
    />
  )
}

export function Textarea({ error, className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & ControlProps) {
  return (
    <textarea
      aria-invalid={error ? true : undefined}
      aria-describedby={error && props.id ? `${props.id}-error` : undefined}
      className={`${estilo(error)} ${className}`}
      {...props}
    />
  )
}

/** Primer mensaje de error de un campo de TanStack Form, solo si el usuario ya lo tocó. */
export function errorDeCampo(meta: { isTouched: boolean; errors: readonly unknown[] }): string | undefined {
  if (!meta.isTouched) return undefined
  const primero = meta.errors.find((e) => typeof e === 'string')
  return typeof primero === 'string' ? primero : undefined
}
