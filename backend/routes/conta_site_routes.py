"""
Rotas da ContaSite do corretor autenticado (API JSON).

A ContaSite é o catálogo público do corretor (relação 1-para-1 com o
usuário de perfil ``Corretor``). Estas rotas permitem que o próprio
corretor logado:

- Consulte seu catálogo (``GET /minha-conta``).
- Atualize os dados editáveis do catálogo (``PUT /minha-conta``).

O catálogo **não** é criado implicitamente: se o corretor ainda não tiver
um, ``GET`` e ``PUT`` retornam 404 (o cadastro inicial é feito por outro
fluxo). O ``slug`` é único globalmente (usado em ``/v/{slug}``); a
unicidade é validada antes de gravar.

O router é montado SEM o prefixo ``/api`` — o ``main.py`` aplica
``API_PREFIX`` ao incluir o router.
"""

# =============================================================================
# Imports
# =============================================================================

# Standard library
from typing import Optional

# Third-party
from fastapi import APIRouter, HTTPException, Request, status

# DTOs (entrada)
from dtos.conta_site_dto import ContaSiteDTO

# Schemas (saída)
from dtos.responses.conta_site_response import ContaSiteResponse

# Models
from model.conta_site_model import ContaSite
from model.usuario_logado_model import UsuarioLogado

# Repositories
from repo import conta_site_repo

# Utilities
from util.api_helpers import checar_rate_limit
from util.auth_decorator import requer_autenticacao
from util.logger_config import logger
from util.perfis import Perfil
from util.rate_limiter import DynamicRateLimiter

# =============================================================================
# Configuração do Router
# =============================================================================

router = APIRouter(prefix="/minha-conta")

# =============================================================================
# Rate Limiters
# =============================================================================

conta_atualizar_limiter = DynamicRateLimiter(
    chave_max="rate_limit_conta_atualizar_max",
    chave_minutos="rate_limit_conta_atualizar_minutos",
    padrao_max=20,
    padrao_minutos=10,
    nome="conta_atualizar",
)


# =============================================================================
# Helpers
# =============================================================================

def _obter_conta_do_usuario(usuario_logado: UsuarioLogado) -> ContaSite:
    """Carrega o catálogo do corretor logado ou levanta 404."""
    conta = conta_site_repo.obter_por_usuario(usuario_logado.id)
    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Você ainda não possui um catálogo cadastrado.",
        )
    return conta


# =============================================================================
# Consulta
# =============================================================================

@router.get("", response_model=ContaSiteResponse)
@requer_autenticacao([Perfil.CORRETOR.value])
async def obter_minha_conta(
    request: Request,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Retorna o catálogo do corretor logado (404 se ainda não existir)."""
    assert usuario_logado is not None
    conta = _obter_conta_do_usuario(usuario_logado)
    return ContaSiteResponse.de_conta(conta)


# =============================================================================
# Atualização
# =============================================================================

@router.put("", response_model=ContaSiteResponse)
@requer_autenticacao([Perfil.CORRETOR.value])
async def atualizar_minha_conta(
    request: Request,
    dto: ContaSiteDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """
    Atualiza os dados editáveis do catálogo do corretor logado.

    Campos atualizados: ``nome_publico``, ``slug``, ``descricao``,
    ``whatsapp``, ``creci``, ``cidade``, ``uf``, ``bairro`` e ``cor``.
    O ``status`` (Ativo/Inativo) é uma ação administrativa e não é
    alterado por esta rota; o ``logo`` é gerenciado pelo fluxo de upload.

    Valida a unicidade do ``slug`` (já normalizado pelo DTO) contra as
    demais catálogos antes de gravar.
    """
    assert usuario_logado is not None
    checar_rate_limit(conta_atualizar_limiter, request)

    conta = _obter_conta_do_usuario(usuario_logado)

    # Unicidade de slug: o slug já vem normalizado pelo DTO. Só conflita se
    # pertencer a OUTRO catálogo (o próprio pode manter o mesmo slug).
    existente = conta_site_repo.obter_por_slug(dto.slug)
    if existente and existente.id != conta.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este slug já está em uso por outro catálogo. Escolha outro.",
        )

    # Aplica os campos editáveis sobre a entidade carregada (preserva
    # status, logo, usuario_id e datas de cadastro).
    conta.nome_publico = dto.nome_publico
    conta.slug = dto.slug
    conta.descricao = dto.descricao
    conta.whatsapp = dto.whatsapp
    conta.creci = dto.creci
    conta.cidade = dto.cidade
    conta.uf = dto.uf
    conta.bairro = dto.bairro
    conta.cor = dto.cor

    if not conta_site_repo.atualizar(conta):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar o catálogo. Tente novamente.",
        )

    logger.info(
        f"Catálogo {conta.id} (slug '{conta.slug}') atualizado pelo "
        f"usuário {usuario_logado.id}"
    )

    atualizada = conta_site_repo.obter_por_id(conta.id)
    return ContaSiteResponse.de_conta(atualizada)
