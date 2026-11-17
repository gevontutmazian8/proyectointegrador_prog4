const moneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
})

const fecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function formatearPrecio(valor: number): string {
  return moneda.format(valor)
}

export function formatearFecha(iso: string): string {
  return fecha.format(new Date(iso))
}
