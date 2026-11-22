import { AxiosError } from 'axios'

interface ErrorValidacion {
  loc: (string | number)[]
  msg: string
}

function esErrorValidacion(valor: unknown): valor is ErrorValidacion {
  return typeof valor === 'object' && valor !== null && 'msg' in valor && 'loc' in valor
}

/** Mensajes en castellano para los campos cuyo error de validación (422) suele llegar en inglés. */
const MENSAJES_CAMPO: Record<string, string> = {
  email: 'El email no es válido o usa un dominio reservado.',
  password: 'La contraseña debe tener entre 8 y 72 caracteres.',
  direccion_entrega: 'La dirección debe tener entre 5 y 200 caracteres.',
  forma_pago: 'La forma de pago debe ser EFECTIVO o TRANSFERENCIA.',
}

/** Convierte el `detail` de la API (texto o lista de errores 422) en un mensaje para la pantalla. */
export function handleApiError(error: unknown, porDefecto = 'Ocurrió un error inesperado.'): string {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verificá que la API esté en ejecución.'
    }
    const datos: unknown = error.response.data
    const detalle = typeof datos === 'object' && datos !== null && 'detail' in datos ? datos.detail : null

    if (typeof detalle === 'string') return detalle
    if (Array.isArray(detalle)) {
      const mensajes = detalle.filter(esErrorValidacion).map((e) => {
        const campo = e.loc.filter((parte) => parte !== 'body').join('.')
        return MENSAJES_CAMPO[campo] ?? (campo ? `${campo}: ${e.msg}` : e.msg)
      })
      if (mensajes.length > 0) return mensajes.join(' · ')
    }
    if (error.response.status === 403) return 'No tenés permisos para esta operación.'
  }
  return porDefecto
}
