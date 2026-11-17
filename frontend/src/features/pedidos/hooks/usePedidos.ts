import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  obtenerPedido,
  obtenerPedidos,
  obtenerResumen,
} from '../api/pedidos'
import type { EstadoPedido, FiltrosPedidos, PedidoCreate } from '../types/pedido'

export const CLAVE_RESUMEN = ['resumen-pedidos'] as const

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => obtenerPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function usePedido(id: number | null) {
  return useQuery({
    queryKey: ['pedido', id],
    queryFn: () => obtenerPedido(id ?? 0),
    enabled: id !== null,
  })
}

export function useResumenPedidos() {
  return useQuery({ queryKey: CLAVE_RESUMEN, queryFn: obtenerResumen })
}

/** Un cambio en un pedido afecta listados, detalle, resumen y stock del catálogo. */
function useInvalidarPedidos() {
  const queryClient = useQueryClient()
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
      queryClient.invalidateQueries({ queryKey: ['pedido'] }),
      queryClient.invalidateQueries({ queryKey: CLAVE_RESUMEN }),
      queryClient.invalidateQueries({ queryKey: ['productos'] }),
    ])
  }
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({
    mutationFn: (payload: PedidoCreate) => crearPedido(payload),
    onSuccess: invalidar,
  })
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: invalidar,
  })
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidos()
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: invalidar,
  })
}
