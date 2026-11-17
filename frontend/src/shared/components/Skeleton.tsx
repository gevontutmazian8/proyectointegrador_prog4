export default function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse bg-crema/70 ${className}`} />
}

/** Grilla de tarjetas fantasma mientras carga el catálogo. */
export function SkeletonTarjetas({ cantidad = 8 }: { cantidad?: number }) {
  return (
    <div role="status" aria-label="Cargando productos" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="border border-tinta/10 bg-white">
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Filas fantasma para tablas y listados. */
export function SkeletonFilas({ filas = 5 }: { filas?: number }) {
  return (
    <div role="status" aria-label="Cargando" className="space-y-2">
      {Array.from({ length: filas }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}
