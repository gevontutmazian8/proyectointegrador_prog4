import Card from '../../../shared/ui/Card'

interface TarjetaResumenProps {
  titulo: string
  valor: string
  detalle?: string
  /** Color de la franja superior, uno por indicador. */
  acento: string
}

export default function TarjetaResumen({ titulo, valor, detalle, acento }: TarjetaResumenProps) {
  return (
    <Card className="animar-entrada">
      <div aria-hidden="true" className={`h-1.5 ${acento}`} />
      <div className="p-5">
        <h2 className="text-xs uppercase tracking-[0.18em] text-tinta/60">{titulo}</h2>
        <p className="mt-2 text-4xl font-light tabular-nums">{valor}</p>
        {detalle && <p className="mt-1 text-sm text-tinta/60">{detalle}</p>}
      </div>
    </Card>
  )
}
