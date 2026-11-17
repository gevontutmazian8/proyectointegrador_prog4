import { useForm } from '@tanstack/react-form'
import Button from '../../../shared/ui/Button'
import Input, { Campo, Select, Textarea, errorDeCampo } from '../../../shared/ui/Input'
import type { FormaPago } from '../types/pedido'

export interface DatosCheckout {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

interface CheckoutFormProps {
  onConfirmar: (datos: DatosCheckout) => Promise<void>
  errorServidor: string | null
}

export default function CheckoutForm({ onConfirmar, errorServidor }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO', notas: '' } as DatosCheckout,
    onSubmit: async ({ value }) => onConfirmar(value),
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
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            if (largo < 5) return 'La dirección debe tener al menos 5 caracteres'
            if (largo > 200) return 'La dirección no puede superar los 200 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Campo id="direccion" label="Dirección de entrega" error={errorDeCampo(field.state.meta)}>
            <Input
              id="direccion"
              autoComplete="street-address"
              placeholder="Calle, número, piso y departamento"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
            />
          </Campo>
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <Campo id="forma_pago" label="Forma de pago" ayuda="El pago se realiza al recibir o por transferencia manual.">
            <Select
              id="forma_pago"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value === 'TRANSFERENCIA' ? 'TRANSFERENCIA' : 'EFECTIVO')}
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </Select>
          </Campo>
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{ onChange: ({ value }) => (value.length > 500 ? 'Máximo 500 caracteres' : undefined) }}
      >
        {(field) => (
          <Campo id="notas" label="Notas (opcional)" error={errorDeCampo(field.state.meta)}>
            <Textarea
              id="notas"
              rows={3}
              placeholder="Timbre, horario, aclaraciones…"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
            />
          </Campo>
        )}
      </form.Field>

      {errorServidor && (
        <p role="alert" className="border-l-4 border-ladrillo bg-red-50 px-4 py-3 text-sm text-ladrillo">
          {errorServidor}
        </p>
      )}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(enviando) => (
          <Button type="submit" variante="acento" className="w-full" cargando={enviando}>
            {enviando ? 'Confirmando…' : 'Confirmar pedido'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
