import { useForm } from '@tanstack/react-form'
import type { Categoria } from '../../categorias/types/categoria'
import Button from '../../../shared/ui/Button'
import Input, { Campo, Select, Textarea, errorDeCampo } from '../../../shared/ui/Input'
import type { Producto, ProductoPayload } from '../types/producto'
import ImagenProducto from './ImagenProducto'

interface ProductoFormProps {
  producto: Producto | null
  categorias: Categoria[]
  errorServidor: string | null
  onGuardar: (payload: ProductoPayload) => Promise<void>
  onCancelar: () => void
}

/** Los inputs trabajan con texto; se convierte a número al enviar. */
interface ValoresForm {
  nombre: string
  descripcion: string
  precio_base: string
  imagen_url: string
  stock: string
  disponible: boolean
  categoria_id: string
}

function validarNumero(valor: string, entero: boolean): string | undefined {
  if (valor.trim() === '') return 'Campo obligatorio'
  const numero = Number(valor)
  if (Number.isNaN(numero)) return 'Ingresá un número'
  if (numero < 0) return 'Debe ser mayor o igual a 0'
  if (entero && !Number.isInteger(numero)) return 'Debe ser un número entero'
  return undefined
}

export default function ProductoForm({ producto, categorias, errorServidor, onGuardar, onCancelar }: ProductoFormProps) {
  const valoresIniciales: ValoresForm = {
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    precio_base: producto ? String(producto.precio_base) : '',
    imagen_url: producto?.imagen_url ?? '',
    stock: producto ? String(producto.stock) : '0',
    disponible: producto?.disponible ?? true,
    categoria_id: producto ? String(producto.categoria_id) : '',
  }

  const form = useForm({
    defaultValues: valoresIniciales,
    onSubmit: async ({ value }) =>
      onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      }),
  })

  // Si el producto pertenece a una categoría dada de baja, se la muestra igual para no perderla.
  const opciones =
    producto && !categorias.some((c) => c.id === producto.categoria_id) ? [...categorias, producto.categoria] : categorias

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
            if (largo < 2) return 'Mínimo 2 caracteres'
            if (largo > 150) return 'Máximo 150 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Campo id="p-nombre" label="Nombre" error={errorDeCampo(field.state.meta)}>
            <Input
              id="p-nombre"
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
        validators={{ onChange: ({ value }) => (value.length > 500 ? 'Máximo 500 caracteres' : undefined) }}
      >
        {(field) => (
          <Campo id="p-descripcion" label="Descripción (opcional)" error={errorDeCampo(field.state.meta)}>
            <Textarea
              id="p-descripcion"
              rows={2}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
            />
          </Campo>
        )}
      </form.Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="precio_base" validators={{ onChange: ({ value }) => validarNumero(value, false) }}>
          {(field) => (
            <Campo id="p-precio" label="Precio base ($)" error={errorDeCampo(field.state.meta)}>
              <Input
                id="p-precio"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={errorDeCampo(field.state.meta)}
              />
            </Campo>
          )}
        </form.Field>

        <form.Field
          name="categoria_id"
          validators={{ onChange: ({ value }) => (value ? undefined : 'Elegí una categoría') }}
        >
          {(field) => (
            <Campo id="p-categoria" label="Categoría" error={errorDeCampo(field.state.meta)}>
              <Select
                id="p-categoria"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={errorDeCampo(field.state.meta)}
              >
                <option value="">Seleccionar…</option>
                {opciones.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                    {c.activo ? '' : ' (dada de baja)'}
                  </option>
                ))}
              </Select>
            </Campo>
          )}
        </form.Field>

        <form.Field name="stock" validators={{ onChange: ({ value }) => validarNumero(value, true) }}>
          {(field) => (
            <Campo id="p-stock" label="Stock (unidades)" error={errorDeCampo(field.state.meta)}>
              <Input
                id="p-stock"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
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
            <label className="flex items-center gap-2 self-end pb-3 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-naranja"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
              />
              Disponible para la venta
            </label>
          )}
        </form.Field>
      </div>

      <form.Field
        name="imagen_url"
        validators={{
          onChange: ({ value }) => {
            const url = value.trim()
            if (url === '') return undefined
            if (url.length > 500) return 'Máximo 500 caracteres'
            return /^https?:\/\/\S+$/.test(url) ? undefined : 'Ingresá una URL que empiece con http:// o https://'
          },
        }}
      >
        {(field) => (
          <div className="grid items-end gap-4 sm:grid-cols-[1fr_6rem]">
            <Campo id="p-imagen" label="URL de la imagen (opcional)" error={errorDeCampo(field.state.meta)}>
              <Input
                id="p-imagen"
                type="url"
                placeholder="https://…"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={errorDeCampo(field.state.meta)}
              />
            </Campo>
            <ImagenProducto
              key={field.state.value}
              url={field.state.value.trim() || null}
              nombre={form.getFieldValue('nombre') || 'Vista previa'}
              className="aspect-[4/3] w-24"
            />
          </div>
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
              {producto ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  )
}
