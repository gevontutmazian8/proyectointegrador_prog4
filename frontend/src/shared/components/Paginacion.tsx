interface PaginacionProps {
  pagina: number
  totalPaginas: number
  onCambiar: (pagina: number) => void
  deshabilitado?: boolean
}

const ESTILO =
  'min-w-10 border border-tinta/25 px-3 py-2 text-sm transition-colors hover:border-tinta hover:bg-arena disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'

/** Paginación numérica: muestra la primera, la última y las vecinas de la actual. */
export default function Paginacion({ pagina, totalPaginas, onCambiar, deshabilitado = false }: PaginacionProps) {
  if (totalPaginas <= 1) return null

  const numeros = Array.from({ length: totalPaginas }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === totalPaginas || Math.abs(n - pagina) <= 1,
  )

  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        className={ESTILO}
        disabled={deshabilitado || pagina <= 1}
        onClick={() => onCambiar(pagina - 1)}
      >
        ← Anterior
      </button>
      {numeros.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - (numeros[i - 1] ?? n) > 1 && <span className="text-tinta/40">…</span>}
          <button
            type="button"
            className={`${ESTILO} ${n === pagina ? 'border-carbon bg-carbon text-white hover:border-carbon hover:bg-carbon' : ''}`}
            aria-current={n === pagina ? 'page' : undefined}
            disabled={deshabilitado}
            onClick={() => onCambiar(n)}
          >
            {n}
          </button>
        </span>
      ))}
      <button
        type="button"
        className={ESTILO}
        disabled={deshabilitado || pagina >= totalPaginas}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente →
      </button>
    </nav>
  )
}
