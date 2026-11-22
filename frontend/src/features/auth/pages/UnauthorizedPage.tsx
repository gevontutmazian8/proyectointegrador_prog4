import { Link } from 'react-router-dom'

export default function UnauthorizedPage() {
  return (
    <div className="bg-crema px-4 py-20">
      <div className="mx-auto max-w-lg bg-white p-8 text-center shadow-[8px_8px_0_rgb(0_0_0/0.12)]">
        <p className="text-6xl font-light text-naranja-oscuro">403</p>
        <h1 className="mt-2 text-2xl font-medium">No tenés permiso para ver esta página</h1>
        <p className="mt-3 text-tinta/70">Esta sección es solo para administradores.</p>
        <Link
          to="/"
          className="mt-8 inline-block bg-carbon px-5 py-2.5 text-sm uppercase tracking-[0.12em] text-white transition-colors hover:bg-naranja-oscuro"
        >
          Volver al catálogo
        </Link>
      </div>
    </div>
  )
}
