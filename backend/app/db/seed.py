"""Carga inicial idempotente: `python -m app.db.seed`.

Crea el usuario admin, las categorías y los productos solo si todavía no existen,
así que puede ejecutarse varias veces sin duplicar datos.
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import ROL_ADMIN, Usuario

# Credenciales de demostración pedidas por la consigna. No usar en producción.
ADMIN = {
    "username": "admin",
    "password": "Admin1234!",
    "full_name": "Administrador Food Store",
    "email": "admin@foodstore.local",
}

CATEGORIAS = [
    ("Pizzas", "Pizzas a la piedra, de masa fina y al molde."),
    ("Hamburguesas", "Hamburguesas de carne, pollo y veggie con papas."),
    ("Ensaladas", "Opciones frescas y livianas."),
    ("Bebidas", "Gaseosas, limonadas y aguas."),
    ("Postres", "Dulces para cerrar la comida."),
]


def _img(foto: str) -> str:
    return f"https://images.unsplash.com/{foto}?auto=format&fit=crop&w=800&q=70"


# (categoría, nombre, descripción, precio, stock, imagen)
PRODUCTOS = [
    ("Pizzas", "Pizza muzzarella", "Salsa de tomate, muzzarella y orégano.", 9800, 25,
     _img("photo-1513104890138-7c749659a591")),
    ("Pizzas", "Pizza napolitana", "Muzzarella, rodajas de tomate, ajo y albahaca.", 11200, 20,
     _img("photo-1574071318508-1cdbab80d002")),
    ("Pizzas", "Pizza de pepperoni", "Muzzarella y pepperoni crocante.", 12500, 15,
     _img("photo-1565299624946-b28f40a0ae38")),
    ("Hamburguesas", "Hamburguesa clásica", "Medallón de carne, cheddar, lechuga y tomate.", 8900, 30,
     _img("photo-1568901346375-23c9450c58cd")),
    ("Hamburguesas", "Hamburguesa doble con papas", "Doble medallón, panceta y papas fritas.", 11900, 20,
     _img("photo-1571091718767-18b5b1457add")),
    ("Ensaladas", "Ensalada César", "Lechuga, pollo grillado, croutons y aderezo César.", 7600, 18,
     _img("photo-1546069901-ba9599a7e63c")),
    ("Bebidas", "Limonada con menta", "Limonada natural de 500 ml.", 3200, 40,
     _img("photo-1437418747212-8d9709afab22")),
    ("Bebidas", "Gaseosa cola 500 ml", "Botella de 500 ml bien fría.", 2500, 60,
     _img("photo-1622483767028-3f66f32aef97")),
    ("Postres", "Helado artesanal", "Dos bochas a elección.", 4300, 35,
     _img("photo-1563805042-7684c019e1cb")),
    ("Postres", "Panqueques con frutos rojos", "Con miel y frutos rojos frescos.", 5200, 12,
     _img("photo-1567620905732-2d1ec7ab7445")),
]


def _crear_admin(session: Session) -> bool:
    if session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first():
        return False
    session.add(
        Usuario(
            username=ADMIN["username"],
            full_name=ADMIN["full_name"],
            email=ADMIN["email"],
            hashed_password=hash_password(ADMIN["password"]),
            role=ROL_ADMIN,
        )
    )
    return True


def _crear_categorias(session: Session) -> dict[str, Categoria]:
    categorias: dict[str, Categoria] = {}
    for nombre, descripcion in CATEGORIAS:
        categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
        if categoria is None:
            categoria = Categoria(nombre=nombre, descripcion=descripcion)
            session.add(categoria)
            session.flush()
        categorias[nombre] = categoria
    return categorias


def _crear_productos(session: Session, categorias: dict[str, Categoria]) -> int:
    creados = 0
    for categoria, nombre, descripcion, precio, stock, imagen in PRODUCTOS:
        if session.exec(select(Producto).where(Producto.nombre == nombre)).first():
            continue
        categoria_id = categorias[categoria].id
        assert categoria_id is not None
        session.add(
            Producto(
                categoria_id=categoria_id,
                nombre=nombre,
                descripcion=descripcion,
                precio_base=precio,
                stock=stock,
                imagen_url=imagen,
            )
        )
        creados += 1
    return creados


def main() -> None:
    create_all_tables()
    with session_factory() as session, session.begin():
        admin_creado = _crear_admin(session)
        categorias = _crear_categorias(session)
        productos_creados = _crear_productos(session, categorias)
    print(
        f"Seed completo: admin {'creado' if admin_creado else 'ya existía'}, "
        f"{len(categorias)} categorías, {productos_creados} productos nuevos."
    )


if __name__ == "__main__":
    main()
