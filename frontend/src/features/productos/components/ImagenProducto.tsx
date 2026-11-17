import { useState } from 'react'

interface ImagenProductoProps {
  url: string | null
  nombre: string
  className?: string
}

/** Imagen con proporción fija; si falta o no carga, muestra una etiqueta con la inicial. */
export default function ImagenProducto({ url, nombre, className = '' }: ImagenProductoProps) {
  const [fallo, setFallo] = useState(false)

  if (!url || fallo) {
    return (
      <div
        role="img"
        aria-label={nombre}
        className={`flex items-center justify-center bg-crema text-4xl font-light text-turquesa-oscuro ${className}`}
      >
        {nombre.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={nombre}
      loading="lazy"
      onError={() => setFallo(true)}
      className={`bg-crema object-cover ${className}`}
    />
  )
}
