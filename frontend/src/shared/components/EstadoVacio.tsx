import type { ReactNode } from 'react'

interface EstadoVacioProps {
  titulo: string
  descripcion?: string
  accion?: ReactNode
}

export default function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="border border-dashed border-tinta/25 bg-arena px-6 py-14 text-center">
      <p className="text-xl font-medium">{titulo}</p>
      {descripcion && <p className="mx-auto mt-2 max-w-md text-tinta/70">{descripcion}</p>}
      {accion && <div className="mt-6 flex justify-center">{accion}</div>}
    </div>
  )
}
