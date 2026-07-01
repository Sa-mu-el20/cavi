"""
Rotas administrativas do CRUD de Características/Comodidades (API JSON).

Permite ao administrador listar, criar, editar e excluir comodidades que os
corretores marcam nos imóveis (relação N:N). Mutações restritas ao perfil
Administrador; a listagem (GET) também é liberada ao Corretor, pois o
formulário de imóvel precisa do catálogo para exibir os checkboxes.

Camada Routes da arquitetura Routes -> DTOs -> Repos -> SQL -> DB.
"""
from typing import Optional

from fastapi import APIRouter, HTTPException, Request, Response, status

from dtos.caracteristica_dto import (
    CriarCaracteristicaDTO,
    AtualizarCaracteristicaDTO,
)
from dtos.responses.caracteristica_response import CaracteristicaResponse

from model.caracteristica_model import Caracteristica
from model.usuario_logado_model import UsuarioLogado

from repo import caracteristica_repo

from util.api_helpers import checar_rate_limit
from util.auth_decorator import requer_autenticacao
from util.logger_config import logger
from util.perfis import Perfil
from util.rate_limiter import DynamicRateLimiter

# =============================================================================
# Configuração do Router
# =============================================================================

router = APIRouter(prefix="/admin/caracteristicas")

# =============================================================================
# Rate Limiters
# =============================================================================

caracteristica_limiter = DynamicRateLimiter(
    chave_max="rate_limit_caracteristica_max",
    chave_minutos="rate_limit_caracteristica_minutos",
    padrao_max=30,
    padrao_minutos=10,
    nome="caracteristica",
)


# =============================================================================
# Helpers
# =============================================================================

def _obter_ou_404(id: int) -> Caracteristica:
    """Carrega a característica pelo ID ou lança 404."""
    c = caracteristica_repo.obter_por_id(id)
    if not c:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comodidade não encontrada.",
        )
    return c


# =============================================================================
# Listagem
# =============================================================================

@router.get("", response_model=list[CaracteristicaResponse])
@requer_autenticacao([Perfil.ADMIN.value, Perfil.CORRETOR.value])
async def listar(
    request: Request,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Lista todas as comodidades cadastradas (ordenadas por nome).

    Leitura liberada para Administrador e Corretor: o catálogo de comodidades é
    compartilhado e o formulário de imóvel do corretor precisa carregá-lo para
    exibir os checkboxes. A criação/edição/exclusão permanece restrita ao Admin.
    """
    assert usuario_logado is not None
    todas = caracteristica_repo.obter_todos()
    return [CaracteristicaResponse.de_caracteristica(c) for c in todas]


# =============================================================================
# Criação
# =============================================================================

@router.post("", response_model=CaracteristicaResponse, status_code=status.HTTP_201_CREATED)
@requer_autenticacao([Perfil.ADMIN.value])
async def criar(
    request: Request,
    dto: CriarCaracteristicaDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Cria uma comodidade nova (nome único)."""
    assert usuario_logado is not None
    checar_rate_limit(caracteristica_limiter, request)

    if caracteristica_repo.obter_por_nome(dto.nome):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe uma comodidade com esse nome.",
        )

    nova = Caracteristica(id=0, nome=dto.nome, icone=dto.icone)
    novo_id = caracteristica_repo.inserir(nova)
    if not novo_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao cadastrar a comodidade. Tente novamente.",
        )

    logger.info(f"Comodidade #{novo_id} '{dto.nome}' criada por admin {usuario_logado.id}")
    return CaracteristicaResponse.de_caracteristica(caracteristica_repo.obter_por_id(novo_id))


# =============================================================================
# Atualização
# =============================================================================

@router.put("/{id}", response_model=CaracteristicaResponse)
@requer_autenticacao([Perfil.ADMIN.value])
async def atualizar(
    request: Request,
    id: int,
    dto: AtualizarCaracteristicaDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Edita o nome/ícone de uma comodidade."""
    assert usuario_logado is not None
    _obter_ou_404(id)

    existente = caracteristica_repo.obter_por_nome(dto.nome)
    if existente and existente.id != id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe outra comodidade com esse nome.",
        )

    atualizada = Caracteristica(id=id, nome=dto.nome, icone=dto.icone)
    if not caracteristica_repo.atualizar(atualizada):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar a comodidade. Tente novamente.",
        )

    logger.info(f"Comodidade #{id} atualizada por admin {usuario_logado.id}")
    return CaracteristicaResponse.de_caracteristica(caracteristica_repo.obter_por_id(id))


# =============================================================================
# Exclusão
# =============================================================================

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
@requer_autenticacao([Perfil.ADMIN.value])
async def excluir(
    request: Request,
    id: int,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Exclui uma comodidade (os vínculos caem por ON DELETE CASCADE)."""
    assert usuario_logado is not None
    _obter_ou_404(id)

    caracteristica_repo.excluir(id)
    logger.info(f"Comodidade #{id} excluída por admin {usuario_logado.id}")
    return Response(status_code=status.HTTP_204_NO_CONTENT)