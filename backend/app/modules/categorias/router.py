from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Response, status

from app.core.deps import AdminActual
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import (
    CategoriaError,
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["Categorías"])

ERRORES: dict[type[CategoriaError], int] = {
    CategoriaNoEncontrada: status.HTTP_404_NOT_FOUND,
    NombreDuplicado: status.HTTP_409_CONFLICT,
}


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]
CategoriaId = Annotated[int, Path(ge=1)]


def _a_http(error: CategoriaError) -> HTTPException:
    return HTTPException(ERRORES.get(type(error), status.HTTP_400_BAD_REQUEST), detail=str(error))


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: ServiceDep) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: CategoriaId, service: ServiceDep) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except CategoriaError as error:
        raise _a_http(error) from error


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(datos: CategoriaCreate, _: AdminActual, service: ServiceDep) -> CategoriaRead:
    try:
        return service.crear(datos)
    except CategoriaError as error:
        raise _a_http(error) from error


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    categoria_id: CategoriaId, datos: CategoriaUpdate, _: AdminActual, service: ServiceDep
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, datos)
    except CategoriaError as error:
        raise _a_http(error) from error


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def eliminar_categoria(categoria_id: CategoriaId, _: AdminActual, service: ServiceDep) -> Response:
    try:
        service.eliminar(categoria_id)
    except CategoriaError as error:
        raise _a_http(error) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)
