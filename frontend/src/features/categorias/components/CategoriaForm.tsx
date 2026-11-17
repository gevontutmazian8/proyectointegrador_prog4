import { useForm } from '@tanstack/react-form'
import Button from '../../../shared/ui/Button'
import Input, { Campo, Textarea, errorDeCampo } from '../../../shared/ui/Input'
import type { Categoria, CategoriaPayload } from '../types/categoria'

interface CategoriaFormProps {
  categoria: Categoria | null
  errorServidor: string | null
  onGuardar: (payload: CategoriaPayload) => Promise<void>
  onCancelar: () => void
}

export default function CategoriaForm({ categoria, errorServidor, onGuardar, onCancelar }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? '', descripcion: categoria?.descripcion ?? '' },
    onSubmit: async ({ value }) =>
      onGuardar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }),
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
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            if (largo < 2) return 'El nombre debe tener al menos 2 caracteres'
            if (largo > 100) return 'Máximo 100 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Campo id="cat-nombre" label="Nombre" error={errorDeCampo(field.state.meta)}>
            <Input
              id="cat-nombre"
              autoFocus
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
            />
          </Campo>
        )}
      </form.Field>

      <form.Field
        name="descripcion"
        validators={{ onChange: ({ value }) => (value.length > 255 ? 'Máximo 255 caracteres' : undefined) }}
      >
        {(field) => (
          <Campo id="cat-descripcion" label="Descripción (opcional)" error={errorDeCampo(field.state.meta)}>
            <Textarea
              id="cat-descripcion"
              rows={3}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
            />
          </Campo>
        )}
      </form.Field>

      {errorServidor && (
        <p role="alert" className="border-l-4 border-ladrillo bg-red-50 px-4 py-2 text-sm text-ladrillo">
          {errorServidor}
        </p>
      )}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(enviando) => (
          <div className="flex justify-end gap-3 pt-2">
            <Button variante="secundario" onClick={onCancelar} disabled={enviando}>
              Cancelar
            </Button>
            <Button type="submit" cargando={enviando}>
              {categoria ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  )
}
