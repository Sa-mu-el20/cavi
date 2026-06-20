"""
Rotas administrativas para gerenciamento de corretores e suas vitrines (API JSON).

Permite que administradores:
- Listem todos os corretores do sistema (usuário + vitrine + qtd de imóveis),
  de forma paginada e com filtros opcionais (termo e status).
- Ativem/inativem a vitrine (``ContaSite``) de um corretor.

Camada Routes da arquitetura Routes -> DTOs -> Repos -> SQL -> DB. Respostas
seguem o contrato de API (envelope ``PaginaResponse`` na listagem; erros via
handlers globais). Acesso restrito ao perfil Administrador.
"""

# =============================================================================
# Imports
# =============================================================================

# Standard library
from typing import Optional

# Third-party
from fastapi import APIRouter, HTTPException, Request, status

# DTOs (entrada)
from dtos.conta_site_dto import AlterarStatusContaDTO

# Schemas (saída)
from dtos.responses.comum import PaginaResponse
from dtos.responses.conta_site_response import (
    ContaSiteResponse,
    CorretorAdminResponse,
)

# Models
from model.conta_site_model import ContaSite
from model.usuario_logado_model import UsuarioLogado

# Repositories
from repo import conta_site_repo, imovel_repo

# Utilities
from util.api_helpers import checar_rate_limit
from util.auth_decorator import requer_autenticacao
from util.logger_config import logger
from util.paginacao_util import paginar
from util.perfis import Perfil
from util.rate_limiter import DynamicRateLimiter
from util.status_conta import StatusConta

# =============================================================================
# Configuração do Router
# =============================================================================

router = APIRouter(prefix="/admin/corretores")

# =============================================================================
# Rate Limiters
# =============================================================================

admin_corretores_limiter = DynamicRateLimiter(
    chave_max="rate_limit_admin_corretores_max",
    chave_minutos="rate_limit_admin_corretores_minutos",
    padrao_max=10,
    padrao_minutos=1,
    nome="admin_corretores",
)


# =============================================================================
# Helpers
# =============================================================================

def _obter_conta_ou_404(conta_id: int) -> ContaSite:
    """Carrega a vitrine (``ContaSite``) pelo ID ou lança 404."""
    conta = conta_site_repo.obter_por_id(conta_id)
    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Corretor (vitrine) não encontrado.",
        )
    return conta


# =============================================================================
# Listagem
# =============================================================================

@router.get("", response_model=PaginaResponse[CorretorAdminResponse])
@requer_autenticacao([Perfil.ADMIN.value])
async def listar(
    request: Request,
    pagina: int = 1,
    por_pagina: int = 10,
    q: Optional[str] = None,
    status_filtro: Optional[str] = None,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """
    Lista os corretores (vitrines) de forma paginada.

    Filtros opcionais:
    - ``q``: termo aplicado a nome público, nome/e-mail do usuário e cidade.
    - ``status_filtro``: ``Ativo`` ou ``Inativo``.
    """
    assert usuario_logado is not None

    contas = conta_site_repo.obter_todos()

    # Filtros em memória
    if status_filtro:
        contas = [c for c in contas if c.status.value == status_filtro]

    termo = (q or "").strip().lower()
    if termo:
        def _casa(c: ContaSite) -> bool:
            campos = [
                c.nome_publico,
                c.usuario_nome,
                c.usuario_email,
                c.cidade,
            ]
            return any(campo and termo in campo.lower() for campo in campos)

        contas = [c for c in contas if _casa(c)]

    paginacao = paginar(contas, pagina=pagina, por_pagina=por_pagina)
    items = [
        CorretorAdminResponse.de_conta(
            c, imovel_repo.contar_por_conta(c.id)
        )
        for c in paginacao.items
    ]
    return PaginaResponse.de_paginacao(paginacao, items)


# =============================================================================
# Alteração de status (ativar/inativar vitrine)
# =============================================================================

@router.patch("/{conta_id}/status", response_model=ContaSiteResponse)
@requer_autenticacao([Perfil.ADMIN.value])
async def alterar_status(
    request: Request,
    conta_id: int,
    dto: AlterarStatusContaDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Ativa ou inativa a vitrine (``ContaSite``) de um corretor."""
    assert usuario_logado is not None
    checar_rate_limit(admin_corretores_limiter, request)

    _obter_conta_ou_404(conta_id)

    novo_status = StatusConta(dto.status)
    if not conta_site_repo.alterar_status(conta_id, novo_status):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao alterar o status da vitrine. Tente novamente.",
        )

    logger.info(
        f"Vitrine {conta_id} alterada para status '{novo_status.value}' "
        f"por admin {usuario_logado.id}"
    )

    atualizada = _obter_conta_ou_404(conta_id)
    return ContaSiteResponse.de_conta(atualizada)
