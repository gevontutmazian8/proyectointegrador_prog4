/** CategoriaRead del backend. */
export interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
}

/** CategoriaCreate / CategoriaUpdate. */
export interface CategoriaPayload {
  nombre: string
  descripcion: string | null
}
