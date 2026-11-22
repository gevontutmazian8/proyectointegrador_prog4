import type { ReactNode } from 'react'

interface AuthCardProps {
  titulo: string
  subtitulo: string
  children: ReactNode
  pie: ReactNode
}

/** Marco común de login y registro: franja crema con la tarjeta centrada. */
export default function AuthCard({ titulo, subtitulo, children, pie }: AuthCardProps) {
  return (
    <div className="bg-crema px-4 py-12 sm:py-20">
      <div className="animar-entrada mx-auto w-full max-w-md bg-white p-8 shadow-[8px_8px_0_rgb(0_0_0/0.12)]">
        <h1 className="flex items-center gap-3 text-3xl uppercase tracking-wide text-naranja-oscuro">
          <span aria-hidden="true" className="h-9 w-2.5 bg-naranja" />
          {titulo}
        </h1>
        <p className="mt-2 text-tinta/70">{subtitulo}</p>
        <div className="mt-8">{children}</div>
        <div className="mt-8 border-t border-tinta/10 pt-5 text-sm text-tinta/70">{pie}</div>
      </div>
    </div>
  )
}
