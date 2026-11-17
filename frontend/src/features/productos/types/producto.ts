import type { Categoria } from '../../categorias/types/categoria'

/** ProductoRead del backend. */
export interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  activo: boolean
  categoria_id: number
  categoria: Categoria
}

/** ProductoCreate / ProductoUpdate. */
export interface ProductoPayload {
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  categoria_id: number
}

/** ProductoStockUpdate. */
export interface ProductoStockPayload {
  stock?: number
  disponible?: boolean
}

/** ProductosPaginados. */
export interface ProductosPaginados {
  total: number
  items: Producto[]
}

export interface FiltrosProductos {
  skip: number
  limit: number
  search?: string
  categoria_id?: number
  disponible?: boolean
}
