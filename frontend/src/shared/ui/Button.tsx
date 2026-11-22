import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'acento' | 'secundario' | 'peligro' | 'texto'
type Tamano = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: Tamano
  cargando?: boolean
}

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-carbon text-white hover:bg-naranja-oscuro',
  acento: 'bg-naranja font-semibold text-carbon hover:bg-naranja-oscuro hover:text-white',
  secundario: 'border border-tinta/30 bg-white text-tinta hover:border-tinta hover:bg-arena',
  peligro: 'border border-ladrillo/40 bg-white text-ladrillo hover:bg-ladrillo hover:text-white',
  texto: 'text-tinta underline-offset-4 hover:text-naranja-oscuro hover:underline',
}

const TAMANOS: Record<Tamano, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
    />
  )
}

export default function Button({
  variante = 'primario',
  tamano = 'md',
  cargando = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={`inline-flex items-center justify-center gap-2 font-medium uppercase tracking-[0.1em] transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
      {...props}
    >
      {cargando && <Spinner />}
      {children}
    </button>
  )
}
