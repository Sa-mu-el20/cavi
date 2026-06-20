"""
Rotas PÚBLICAS do catálogo do corretor (API JSON, sem autenticação).

Expõem apenas dados de contas ``Ativo`` e imóveis ``Publicado``. Como são
todos verbos GET, ficam naturalmente ISENTOS de CSRF. Servem a Home (listagem
de corretores) e as páginas públicas ``/v/{slug}`` (catálogo + listagem de
imóveis + detalhe do imóvel).

Camada Routes da arquitetura Routes -> DTOs -> Repos -> SQL -> DB. Segue o
estilo de ``routes/chamados_routes.py`` (rate limit por IP via
``util.api_helpers.checar_rate_limit`` e respostas tipadas).
"""

# =============================================================================
# Imports
# =============================================================================

# Standard library
from typing import Optional

# Third-party
from fastapi import APIRouter, HTTPException, Request, status

# Schemas (saída)
from dtos.responses.comum import PaginaResponse
from dtos.responses.imovel_response import ImovelResponse, ImovelResumoResponse
from dtos.responses.publico_response import (
    CorretorCatalogoResponse,
    ImovelPublicoDetalheResponse,
    CatalogoPublicoResponse,
)

# Models
from model.conta_site_model import ContaSite
from model.imovel_model import StatusImovel

# Repositories
from repo import conta_site_repo, imovel_repo

# Utilities
from util.api_helpers import checar_rate_limit
from util.rate_limiter import DynamicRateLimiter
from util.status_conta import StatusConta

# =============================================================================
# Configuração do Router
# =============================================================================

router = APIRouter(prefix="/publico")

# =============================================================================
# Rate Limiters (proteção contra scraping abusivo das rotas públicas)
# =============================================================================

publico_listagem_limiter = DynamicRateLimiter(
    chave_max="rate_limit_publico_listagem_max",
    chave_minutos="rate_limit_publico_listagem_minutos",
    padrao_max=120,
    padrao_minutos=1,
    nome="publico_listagem",
)


# =============================================================================
# Helpers
# =============================================================================

def _obter_conta_ativa_por_slug(slug: str) -> ContaSite:
    """Resolve o catálogo pelo slug exigindo status Ativo (404 caso contrário)."""
    conta = conta_site_repo.obter_por_slug(slug)
    if not conta or conta.status != StatusConta.ATIVO:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Catálogo não encontrado.",
        )
    return conta


# =============================================================================
# Listagem de corretores (Home)
# =============================================================================

@router.get("/corretores", response_model=list[CorretorCatalogoResponse])
async def listar_corretores(request: Request):
    """Lista os catálogos ativos para a Home, com a contagem de imóveis publicados."""
    checar_rate_limit(publico_listagem_limiter, request)

    contas = conta_site_repo.listar_ativas()
    return [
        CorretorCatalogoResponse.de_conta(
            conta, imovel_repo.contar_publicados(conta.id)
        )
        for conta in contas
    ]


# =============================================================================
# Catálogo público (cabeçalho)
# =============================================================================

@router.get("/catalogo/{slug}", response_model=CatalogoPublicoResponse)
async def obter_catalogo(request: Request, slug: str):
    """Dados públicos de um catálogo ativo (404 se inexistente ou Inativo)."""
    checar_rate_limit(publico_listagem_limiter, request)

    conta = _obter_conta_ativa_por_slug(slug)
    return CatalogoPublicoResponse.de_conta(conta)


# =============================================================================
# Imóveis publicados de um catálogo (listagem com filtros)
# =============================================================================

@router.get(
    "/catalogo/{slug}/imoveis",
    response_model=PaginaResponse[ImovelResumoResponse],
)
async def listar_imoveis_do_catalogo(
    request: Request,
    slug: str,
    pagina: int = 1,
    por_pagina: int = 12,
    finalidade: Optional[str] = None,
    tipo: Optional[str] = None,
    bairro: Optional[str] = None,
    preco_min: Optional[float] = None,
    preco_max: Optional[float] = None,
):
    """
    Lista (paginado) os imóveis PUBLICADOS de um catálogo ativo.

    Filtros opcionais: ``finalidade``, ``tipo``, ``bairro`` (parcial),
    ``preco_min`` e ``preco_max``.
    """
    checar_rate_limit(publico_listagem_limiter, request)

    conta = _obter_conta_ativa_por_slug(slug)

    paginacao = imovel_repo.listar_por_conta(
        conta_site_id=conta.id,
        pagina=pagina,
        por_pagina=por_pagina,
        finalidade=finalidade,
        tipo=tipo,
        bairro=bairro,
        preco_min=preco_min,
        preco_max=preco_max,
        somente_publicados=True,
    )

    # Carrega agregados (endereço/foto principal) para enriquecer os cards.
    itens = [
        ImovelResumoResponse.de_imovel(imovel_repo.obter_detalhe(imovel.id) or imovel)
        for imovel in paginacao.items
    ]
    return PaginaResponse.de_paginacao(paginacao, itens)


# =============================================================================
# Detalhe público de um imóvel
# =============================================================================

@router.get("/imoveis/{id}", response_model=ImovelPublicoDetalheResponse)
async def obter_imovel(request: Request, id: int):
    """
    Detalhe de um imóvel publicado (endereço + fotos) com os dados do catálogo.

    Retorna 404 se o imóvel não existir, estiver Oculto ou pertencer a uma
    um catálogo inexistente/Inativo.
    """
    checar_rate_limit(publico_listagem_limiter, request)

    imovel = imovel_repo.obter_detalhe(id)
    if not imovel or imovel.status_publicacao != StatusImovel.PUBLICADO:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imóvel não encontrado.",
        )

    conta = conta_site_repo.obter_por_id(imovel.conta_site_id)
    if not conta or conta.status != StatusConta.ATIVO:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imóvel não encontrado.",
        )

    return ImovelPublicoDetalheResponse(
        imovel=ImovelResponse.de_imovel(imovel),
        catalogo=CatalogoPublicoResponse.de_conta(conta),
    )
