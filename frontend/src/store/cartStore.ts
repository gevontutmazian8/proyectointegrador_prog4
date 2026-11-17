import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/** Representación local del carrito: el backend valida precio y stock al confirmar. */
export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
}

interface ProductoAgregable {
  id: number
  nombre: string
  precio_base: number
}

interface CartState {
  items: ItemCarrito[]
  agregar: (producto: ProductoAgregable, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar(producto, cantidad = 1) {
        set(({ items }) => {
          const existente = items.find((i) => i.producto_id === producto.id)
          if (existente) {
            return {
              items: items.map((i) =>
                i.producto_id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i,
              ),
            }
          }
          const nuevo: ItemCarrito = {
            producto_id: producto.id,
            nombre: producto.nombre,
            precio_unitario: producto.precio_base,
            cantidad,
          }
          return { items: [...items, nuevo] }
        })
      },

      quitar(productoId) {
        set(({ items }) => ({ items: items.filter((i) => i.producto_id !== productoId) }))
      },

      cambiarCantidad(productoId, cantidad) {
        if (cantidad < 1) {
          get().quitar(productoId)
          return
        }
        set(({ items }) => ({
          items: items.map((i) => (i.producto_id === productoId ? { ...i, cantidad } : i)),
        }))
      },

      vaciar() {
        set({ items: [] })
      },

      total() {
        return get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0)
      },
    }),
    {
      name: 'foodstore-carrito',
      storage: createJSONStorage(() => localStorage),
      partialize: (estado) => ({ items: estado.items }),
    },
  ),
)

/** Cantidad total de unidades, para el contador de la barra de navegación. */
export function useCantidadEnCarrito(): number {
  return useCartStore((estado) => estado.items.reduce((suma, i) => suma + i.cantidad, 0))
}
