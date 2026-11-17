import { useForm } from '@tanstack/react-form'
import Button from '../../../shared/ui/Button'
import Input, { Campo, errorDeCampo } from '../../../shared/ui/Input'
import type { Producto, ProductoStockPayload } from '../types/producto'

interface StockFormProps {
  producto: Producto
  errorServidor: string | null
  onGuardar: (payload: ProductoStockPayload) => Promise<void>
  onCancelar: () => void
}

/** PATCH /productos/{id}/stock: stock y disponibilidad. */
export default function StockForm({ producto, errorServidor, onGuardar, onCancelar }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: async ({ value }) => onGuardar({ stock: Number(value.stock), disponible: value.disponible }),
  })

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <p className="text-tinta/70">
        <strong className="text-tinta">{producto.nombre}</strong> · stock actual {producto.stock} u.
      </p>

      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) => {
            const numero = Number(value)
            if (value.trim() === '' || Number.isNaN(numero)) return 'Ingresá un número'
            if (!Number.isInteger(numero) || numero < 0) return 'Debe ser un entero mayor o igual a 0'
            return undefined
          },
        }}
      >
        {(field) => (
          <Campo id="s-stock" label="Nuevo stock" error={errorDeCampo(field.state.meta)}>
            <Input
              id="s-stock"
              type="number"
              min="0"
              step="1"
              autoFocus
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
            />
          </Campo>
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-turquesa"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      {errorServidor && (
        <p role="alert" className="border-l-4 border-ladrillo bg-red-50 px-4 py-2 text-sm text-ladrillo">
          {errorServidor}
        </p>
      )}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(enviando) => (
          <div className="flex justify-end gap-3">
            <Button variante="secundario" onClick={onCancelar} disabled={enviando}>
              Cancelar
            </Button>
            <Button type="submit" cargando={enviando}>
              Guardar stock
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  )
}
