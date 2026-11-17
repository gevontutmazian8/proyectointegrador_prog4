import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  obtenerCategorias,
} from '../api/categorias'
import type { CategoriaPayload } from '../types/categoria'

export const CLAVE_CATEGORIAS = ['categorias'] as const

export function useCategorias() {
  return useQuery({ queryKey: CLAVE_CATEGORIAS, queryFn: obtenerCategorias, staleTime: 5 * 60_000 })
}

export function useCrearCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CategoriaPayload) => crearCategoria(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLAVE_CATEGORIAS }),
  })
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CategoriaPayload> }) =>
      actualizarCategoria(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CLAVE_CATEGORIAS })
      // Los productos muestran el nombre de su categoría.
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => eliminarCategoria(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLAVE_CATEGORIAS }),
  })
}
