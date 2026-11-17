import { api } from '../../../shared/api/axiosInstance'
import type { Usuario } from '../../usuarios/types/usuario'
import type { Credenciales, MensajeRespuesta, RegistroPayload } from '../types/auth'

/** Login con formulario OAuth2: el JWT llega en la cookie HttpOnly, nunca en el cuerpo. */
export async function iniciarSesion({ username, password }: Credenciales): Promise<MensajeRespuesta> {
  const formulario = new URLSearchParams({ username, password })
  const { data } = await api.post<MensajeRespuesta>('/auth/token', formulario)
  return data
}

export async function cerrarSesion(): Promise<MensajeRespuesta> {
  const { data } = await api.post<MensajeRespuesta>('/auth/logout')
  return data
}

export async function obtenerPerfil(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me')
  return data
}

export async function registrarUsuario(payload: RegistroPayload): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/auth/register', payload)
  return data
}
