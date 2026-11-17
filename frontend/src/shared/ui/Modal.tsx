import { useEffect, useId, useRef, type ReactNode } from 'react'

interface ModalProps {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  /** Ancho máximo: los formularios largos usan "lg". */
  ancho?: 'md' | 'lg'
  bloqueado?: boolean
}

export default function Modal({ abierto, titulo, onCerrar, children, ancho = 'md', bloqueado = false }: ModalProps) {
  const tituloId = useId()
  const panel = useRef<HTMLDivElement>(null)

  // Escape cierra el modal y el foco entra al panel al abrirse.
  useEffect(() => {
    if (!abierto) return
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null
    panel.current?.focus()
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape' && !bloqueado) onCerrar()
    }
    document.addEventListener('keydown', alPresionar)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', alPresionar)
      document.body.style.overflow = ''
      anterior?.focus()
    }
  }, [abierto, bloqueado, onCerrar])

  if (!abierto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-carbon/60 p-0 sm:items-center sm:p-4"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget && !bloqueado) onCerrar()
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className={`animar-entrada max-h-[92vh] w-full overflow-y-auto bg-white p-6 shadow-[8px_8px_0_rgb(0_0_0/0.18)] focus:outline-none ${ancho === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id={tituloId} className="flex items-center gap-3 text-xl uppercase tracking-wide text-turquesa-oscuro">
            <span aria-hidden="true" className="h-7 w-2 bg-turquesa" />
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            disabled={bloqueado}
            aria-label="Cerrar"
            className="-mr-2 -mt-1 px-2 text-2xl leading-none text-tinta/50 hover:text-tinta disabled:opacity-30"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
