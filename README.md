# Food Store

Sistema de pedidos de comida: los clientes recorren el catálogo, arman un carrito y confirman pedidos
con dirección de entrega y forma de pago; el administrador gestiona categorías, productos, stock,
pedidos y usuarios desde un panel.

Trabajo Práctico Integrador · Programación 4 · Tecnicatura Universitaria en Programación (UTN).

- **Repositorio público:** _pendiente — completar con la URL de GitHub_
- **Video de demostración:** _pendiente — completar con el enlace público_

## Tecnologías

| Parte | Stack |
|---|---|
| Backend | Python 3.11–3.13 · FastAPI 0.163 · SQLModel 0.0.50 (Pydantic v2) · PostgreSQL + psycopg2-binary 2.9 · python-jose 3.5.0 · passlib 1.7.4 + bcrypt 4.0.1 · pydantic-settings 2 · python-multipart 0.0.20 |
| Frontend | React 19 · TypeScript 5.9 (`strict`) · Vite 7 · Tailwind CSS 4 (`@tailwindcss/vite`) · TanStack Query 5 · TanStack Form 1 · TanStack Table 8 · React Router 7 · Zustand 5 · Axios 1 · pnpm |

Las versiones exactas están fijadas en `backend/requirements.txt` y `frontend/package.json`.

## Requisitos previos

- Python 3.11, 3.12 o 3.13 (SQLModel 0.0.22 no funciona con 3.14)
- PostgreSQL 15 o superior
- Node.js 20.19 o superior y pnpm 9 o superior (`npm install -g pnpm`)

## Estructura

```text
food-store/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI, CORS con credenciales y routers bajo /api/v1
│   │   ├── core/                # config, database, security, deps, unit_of_work, base_repository
│   │   ├── modules/
│   │   │   ├── auth/            # router · service · schemas (usa el modelo Usuario)
│   │   │   ├── usuarios/        # models · schemas · repository · unit_of_work · service · router
│   │   │   ├── categorias/      # misma cadena de archivos
│   │   │   ├── productos/       # misma cadena de archivos
│   │   │   └── pedidos/         # misma cadena; RN-01 a RN-06 en service.py
│   │   └── db/seed.py           # carga inicial idempotente
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── shared/              # api (Axios, errores, queryClient), ui, components, layout
│   │   ├── features/            # auth, categorias, productos, usuarios, pedidos
│   │   │                        #   cada una con pages, components, hooks, api y types
│   │   ├── store/               # authStore y cartStore (Zustand + persist)
│   │   ├── routes/              # AppRouter y ProtectedRoute
│   │   ├── App.tsx              # checkSession al montar
│   │   └── main.tsx             # QueryClientProvider
│   ├── package.json
│   └── .env.example
└── README.md
```

## 1. Base de datos (PostgreSQL)

Crear una base vacía, por ejemplo con `psql`:

```sql
CREATE DATABASE foodstore_db;
```

Las tablas se crean solas al iniciar el backend o al ejecutar el seed.

## 2. Backend

```bash
cd backend
python -m venv .venv
```

Activar el entorno virtual:

```bash
# Windows (PowerShell)
.venv\Scripts\Activate.ps1
# Linux / macOS
source .venv/bin/activate
```

Instalar dependencias y configurar las variables de entorno:

```bash
pip install -r requirements.txt
cp .env.example .env
```

Editar `backend/.env` con los datos de tu PostgreSQL y una `SECRET_KEY` propia (ver la tabla de variables).
Después, cargar los datos iniciales y arrancar la API:

```bash
python -m app.db.seed
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación interactiva: http://localhost:8000/docs y http://localhost:8000/redoc

### Variables de entorno del backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://postgres:postgres@localhost:5432/foodstore_db` (desarrollo: `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Firma del JWT, mínimo 32 caracteres | generar con `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |
| `COOKIE_SECURE` | `true` solo si la API se sirve por HTTPS | `false` |

### Usuario administrador del seed

`python -m app.db.seed` es idempotente (se puede ejecutar varias veces sin duplicar datos) y crea:

- Usuario **`admin`** con contraseña **`Admin1234!`** y rol `admin` (credenciales de demostración, no usar en producción).
- 5 categorías y 10 productos con stock e imagen.

## 3. Frontend

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm dev
```

Abrir http://localhost:5173

Para compilar la versión de producción (incluye el chequeo de tipos con `tsc`):

```bash
pnpm build
```

### Variable de entorno del frontend (`frontend/.env`)

| Variable | Ejemplo |
|---|---|
| `VITE_API_URL` | `http://localhost:8000/api/v1` |

> Usá `localhost` tanto en el frontend como en `VITE_API_URL` (no mezclar con `127.0.0.1`): la cookie
> de sesión solo viaja entre orígenes del mismo sitio.

## Flujo de uso

**Cliente (rol `user`)**

1. Se registra en `/register` e inicia sesión en `/login`.
2. Recorre el catálogo (`/`) con búsqueda, filtro por categoría y paginación del servidor.
3. Agrega productos al carrito (`/carrito`), que persiste al recargar la página.
4. Confirma el pedido en `/checkout` con dirección, forma de pago (efectivo o transferencia) y notas.
5. Sigue sus pedidos en `/mis-pedidos`, ve el detalle y puede cancelar los que están `PENDIENTE`.

**Administrador (rol `admin`)**

- `/admin/resumen`: pedidos por estado, pedidos de hoy e ingresos de pedidos entregados.
- `/admin/pedidos`: filtra por estado y avanza o cancela según la máquina de estados.
- `/admin/productos` y `/admin/categorias`: altas, edición, baja lógica, stock y disponibilidad.
- `/admin/usuarios`: activa o desactiva cuentas (no puede desactivarse a sí mismo).

## Decisiones técnicas

- **Arquitectura en capas:** Router → Service → Unit of Work → Repository → Model. El Router obtiene el
  Service con `Depends`; el Service abre `with self.uow as uow:`, aplica las reglas y devuelve el schema
  de salida dentro del bloque. El `commit` solo ocurre en `UnitOfWork.__exit__` (o `rollback` si hubo una
  excepción); ningún Router ni Service llama a `session.commit()`.
- **Pedido transaccional (RN-01):** el pedido, sus líneas y el descuento de stock comparten la sesión del
  `PedidoUnitOfWork`; si un ítem falla, el rollback descarta todo. El precio sale de la base, nunca del
  navegador. Las filas de producto se bloquean con `SELECT … FOR UPDATE` para que dos pedidos simultáneos
  no vendan el mismo stock.
- **Sesión:** JWT en cookie `access_token` HttpOnly de 30 minutos; el frontend nunca lee ni guarda el
  token. El `authStore` persiste solo los datos del usuario y valida la sesión con `/auth/me` al iniciar.
- **Baja lógica:** categorías y productos se dan de baja con `activo = false` y desde ese momento se tratan
  como inexistentes (404). Los pedidos no se borran: se cancelan.
