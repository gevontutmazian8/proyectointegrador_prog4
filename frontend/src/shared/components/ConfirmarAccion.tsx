import type { ReactNode } from 'react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

interface ConfirmarAccionProps {
  abierto: boolean
  titulo: string
  mensaje: ReactNode
  textoConfirmar: string
  peligro?: boolean
  procesando: boolean
  error?: string | null
  onConfirmar: () => void
  onCancelar: () => void
}

/** Diálogo de confirmación reutilizado por cancelaciones, bajas y cambios de estado. */
export default function ConfirmarAccion({
  abierto,
  titulo,
  mensaje,
  textoConfirmar,
  peligro = false,
  procesando,
  error,
  onConfirmar,
  onCancelar,
}: ConfirmarAccionProps) {
  return (
    <Modal abierto={abierto} titulo={titulo} onCerrar={onCancelar} bloqueado={procesando}>
      <div className="text-tinta/80">{mensaje}</div>
      {error && (
        <p role="alert" className="mt-4 border-l-4 border-ladrillo bg-red-50 px-4 py-2 text-sm text-ladrillo">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button variante="secundario" onClick={onCancelar} disabled={procesando}>
          Volver
        </Button>
        <Button variante={peligro ? 'peligro' : 'primario'} onClick={onConfirmar} cargando={procesando}>
          {textoConfirmar}
        </Button>
      </div>
    </Modal>
  )
}
