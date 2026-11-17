import { handleApiError } from '../api/handleApiError'
import Button from '../ui/Button'

interface EstadoErrorProps {
  error: unknown
  titulo?: string
  onReintentar?: () => void
}

export default function EstadoError({ error, titulo = 'No pudimos cargar la información', onReintentar }: EstadoErrorProps) {
  return (
    <div role="alert" className="border-l-4 border-ladrillo bg-red-50 px-6 py-8">
      <p className="text-lg font-medium text-ladrillo">{titulo}</p>
      <p className="mt-1 text-tinta/75">{handleApiError(error)}</p>
      {onReintentar && (
        <Button variante="secundario" tamano="sm" className="mt-4" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
