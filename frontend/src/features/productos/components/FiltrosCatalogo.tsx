import { useState } from 'react'
import type { Categoria } from '../../categorias/types/categoria'
import Button from '../../../shared/ui/Button'
import Input, { Select } from '../../../shared/ui/Input'

interface FiltrosCatalogoProps {
  busqueda: string
  categoriaId: number | undefined
  soloDisponibles: boolean
  categorias: Categoria[]
  onBuscar: (texto: string) => void
  onCategoria: (id: number | undefined) => void
  onSoloDisponibles: (valor: boolean) => void
}

export default function FiltrosCatalogo({
  busqueda,
  categoriaId,
  soloDisponibles,
  categorias,
  onBuscar,
  onCategoria,
  onSoloDisponibles,
}: FiltrosCatalogoProps) {
  const [texto, setTexto] = useState(busqueda)

  return (
    <div className="mb-8 flex flex-col gap-4 border-y border-tinta/10 py-5 lg:flex-row lg:items-end">
      <form
        role="search"
        onSubmit={(evento) => {
          evento.preventDefault()
          onBuscar(texto.trim())
        }}
        className="flex flex-1 gap-2"
      >
        <div className="flex-1">
          <label htmlFor="busqueda" className="mb-1 block text-sm text-tinta/80">
            Buscar por nombre
          </label>
          <Input
            id="busqueda"
            type="search"
            placeholder="Pizza, hamburguesa, helado…"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value)
              if (e.target.value === '' && busqueda !== '') onBuscar('')
            }}
          />
        </div>
        <Button type="submit" className="self-end">
          Buscar
        </Button>
      </form>

      <div className="lg:w-56">
        <label htmlFor="categoria" className="mb-1 block text-sm text-tinta/80">
          Categoría
        </label>
        <Select
          id="categoria"
          value={categoriaId ?? ''}
          onChange={(e) => onCategoria(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">Todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Select>
      </div>

      <label className="flex items-center gap-2 pb-2.5 text-sm text-tinta">
        <input
          type="checkbox"
          className="h-4 w-4 accent-naranja"
          checked={soloDisponibles}
          onChange={(e) => onSoloDisponibles(e.target.checked)}
        />
        Solo disponibles
      </label>
    </div>
  )
}
