import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-tinta/15">
        <p className="mx-auto max-w-6xl px-4 py-5 text-sm text-tinta/60">
          Food Store · Trabajo Práctico Integrador · Programación 4
        </p>
      </footer>
    </div>
  )
}

interface EncabezadoProps {
  titulo: string
  descripcion?: string
  acciones?: ReactNode
}

/** Título de sección con el bloque naranja a la izquierda (identidad de catálogo). */
export function EncabezadoPagina({ titulo, descripcion, acciones }: EncabezadoProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-4">
        <span aria-hidden="true" className="h-14 w-3.5 shrink-0 bg-naranja" />
        <div>
          <h1 className="text-3xl uppercase leading-none tracking-wide text-naranja-oscuro sm:text-4xl">{titulo}</h1>
          {descripcion && <p className="mt-1.5 text-tinta/70">{descripcion}</p>}
        </div>
      </div>
      {acciones && <div className="flex flex-wrap gap-3">{acciones}</div>}
    </div>
  )
}
