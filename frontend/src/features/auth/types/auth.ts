/** UserCreate del backend. */
export interface RegistroPayload {
  username: string
  full_name: string
  email: string
  password: string
}

export interface Credenciales {
  username: string
  password: string
}

export interface MensajeRespuesta {
  message: string
}
