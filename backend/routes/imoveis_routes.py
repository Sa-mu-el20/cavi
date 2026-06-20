"""
Rotas de gerenciamento de imóveis pelo CORRETOR autenticado (API JSON).

Todos os endpoints são escopados à ``conta_site`` do usuário logado (vitrine do
corretor): a conta é resolvida por ``conta_site_repo.obter_por_usuario`` e cada
imóvel só é acessível/editável se ``imovel.conta_site_id`` for igual ao
``id`` dessa conta (ownership). Caso contrário, 403.

Permite ao corretor:
- Listar seus imóveis (paginado, filtro por status de publicação e busca)
- Ver os contadores do dashboard (total/publicados/ocultos)
- Criar imóvel (+ endereço aninhado), iniciando como Oculto
- Ver detalhe (endereço + fotos), atualizar, excluir
- Alternar a publicação (Publicado/Oculto)
- Subir, remover e definir foto principal (upload multipart)

Camada Routes da arquitetura Routes -> DTOs -> Repos -> SQL -> DB.
"""

# =============================================================================
# Imports
# =============================================================================

# Standard library
import re
import unicodedata
import uuid
from typing import Optional

# Third-party
from fastapi import APIRouter, File, Form, HTTPException, Request, Response, UploadFile, status

# DTOs (entrada)
from dtos.imovel_dto import (
    AlterarStatusImovelDTO,
    AtualizarImovelDTO,
    CriarImovelDTO,
)

# Schemas (saída)
from dtos.responses.comum import MensagemResponse, PaginaResponse
from dtos.responses.imovel_response import ImovelResponse, ImovelResumoResponse

# Models
from model.conta_site_model import ContaSite
from model.endereco_imovel_model import EnderecoImovel
from model.foto_imovel_model import FotoImovel
from model.imovel_model import FinalidadeImovel, Imovel, StatusImovel, TipoImovel
from model.usuario_logado_model import UsuarioLogado

# Repositories
from repo import conta_site_repo, foto_imovel_repo, imovel_repo

# Utilities
from util.api_helpers import checar_rate_limit
from util.auth_decorator import requer_autenticacao
from util.logger_config import logger
from util.rate_limiter import DynamicRateLimiter
from util.upload_util import TIPOS_IMAGEM, excluir_arquivo, salvar_arquivo, validar_arquivo

# =============================================================================
# Configuração do Router
# =============================================================================

router = APIRouter(prefix="/imoveis")

# Subdiretório (relativo a static/uploads) onde as fotos de imóveis são salvas.
SUBDIR_FOTOS = "imoveis"

# Limite de upload de foto: 10MB.
FOTO_MAX_BYTES = 10 * 1024 * 1024

# =============================================================================
# Rate Limiters
# =============================================================================

imovel_criar_limiter = DynamicRateLimiter(
    chave_max="rate_limit_imovel_criar_max",
    chave_minutos="rate_limit_imovel_criar_minutos",
    padrao_max=30,
    padrao_minutos=10,
    nome="imovel_criar",
)
imovel_foto_limiter = DynamicRateLimiter(
    chave_max="rate_limit_imovel_foto_max",
    chave_minutos="rate_limit_imovel_foto_minutos",
    padrao_max=60,
    padrao_minutos=10,
    nome="imovel_foto",
)


# =============================================================================
# Helpers
# =============================================================================

def _gerar_slug(texto: str) -> str:
    """Gera um slug simples a partir de um texto (sem garantia de unicidade)."""
    normalizado = unicodedata.normalize("NFKD", texto)
    sem_acento = normalizado.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", sem_acento.lower()).strip("-")
    return slug or "imovel"


def _obter_conta_do_usuario(usuario_logado: UsuarioLogado) -> ContaSite:
    """Resolve a conta-site (vitrine) do corretor logado (404 se não existir)."""
    conta = conta_site_repo.obter_por_usuario(usuario_logado.id)
    if not conta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Você ainda não possui uma vitrine. Crie sua vitrine antes de cadastrar imóveis.",
        )
    return conta


def _obter_imovel_da_conta(id: int, conta: ContaSite) -> Imovel:
    """Carrega o imóvel garantindo que pertence à conta-site do corretor (404/403)."""
    imovel = imovel_repo.obter_por_id(id)
    if not imovel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imóvel não encontrado.",
        )
    if imovel.conta_site_id != conta.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para acessar este imóvel.",
        )
    return imovel


def _endereco_de_dto(dto_endereco) -> Optional[EnderecoImovel]:
    """Converte o endereço aninhado do DTO em entidade (ou None)."""
    if dto_endereco is None:
        return None
    return EnderecoImovel(
        id=0,
        imovel_id=0,
        cep=dto_endereco.cep,
        logradouro=dto_endereco.logradouro,
        numero=dto_endereco.numero,
        bairro=dto_endereco.bairro,
        cidade=dto_endereco.cidade,
        uf=dto_endereco.uf,
        complemento=dto_endereco.complemento,
    )


# =============================================================================
# Dashboard
# =============================================================================

@router.get("/dashboard")
@requer_autenticacao()
async def dashboard(
    request: Request,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Contadores do painel de imóveis da conta do corretor logado."""
    assert usuario_logado is not None
    conta = _obter_conta_do_usuario(usuario_logado)

    return {
        "total": imovel_repo.contar_por_conta(conta.id),
        "publicados": imovel_repo.contar_publicados(conta.id),
        "ocultos": imovel_repo.contar_ocultos(conta.id),
    }


# =============================================================================
# Listagem
# =============================================================================

@router.get("", response_model=PaginaResponse[ImovelResumoResponse])
@requer_autenticacao()
async def listar(
    request: Request,
    pagina: int = 1,
    por_pagina: int = 10,
    status_publicacao: Optional[str] = None,
    busca: Optional[str] = None,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Lista os imóveis da conta do corretor (paginado; filtros opcionais)."""
    assert usuario_logado is not None
    conta = _obter_conta_do_usuario(usuario_logado)

    # Validar status_publicacao quando informado (evita filtro silencioso).
    somente_publicados = False
    filtrar_oculto = False
    if status_publicacao:
        try:
            status_enum = StatusImovel(status_publicacao)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Status de publicação inválido.",
            )
        if status_enum == StatusImovel.PUBLICADO:
            somente_publicados = True
        else:
            filtrar_oculto = True

    paginacao = imovel_repo.listar_por_conta(
        conta_site_id=conta.id,
        pagina=pagina,
        por_pagina=por_pagina,
        somente_publicados=somente_publicados,
    )

    itens = paginacao.items

    # Filtro por status Oculto (a base só tem o atalho "somente_publicados").
    if filtrar_oculto:
        itens = [i for i in itens if i.status_publicacao == StatusImovel.OCULTO]

    # Busca textual em memória (título / código).
    if busca:
        termo = busca.strip().lower()
        itens = [
            i for i in itens
            if termo in (i.titulo or "").lower()
            or termo in (i.codigo or "").lower()
        ]

    return PaginaResponse.de_paginacao(
        paginacao,
        [ImovelResumoResponse.de_imovel(i) for i in itens],
    )


# =============================================================================
# Criação
# =============================================================================

@router.post(
    "",
    response_model=ImovelResponse,
    status_code=status.HTTP_201_CREATED,
)
@requer_autenticacao()
async def criar(
    request: Request,
    dto: CriarImovelDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Cria um imóvel (+ endereço) para a conta do corretor; inicia Oculto."""
    assert usuario_logado is not None
    checar_rate_limit(imovel_criar_limiter, request)
    conta = _obter_conta_do_usuario(usuario_logado)

    imovel = Imovel(
        id=0,
        conta_site_id=conta.id,
        titulo=dto.titulo,
        tipo=TipoImovel(dto.tipo),
        finalidade=FinalidadeImovel(dto.finalidade),
        preco=dto.preco,
        codigo=dto.codigo,
        slug=_gerar_slug(dto.titulo),
        descricao=dto.descricao,
        area=dto.area,
        quartos=dto.quartos,
        banheiros=dto.banheiros,
        vagas=dto.vagas,
        destaque=dto.destaque,
        status_publicacao=StatusImovel.OCULTO,
        endereco=_endereco_de_dto(dto.endereco),
    )
    novo_id = imovel_repo.inserir(imovel)
    if not novo_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao cadastrar o imóvel. Tente novamente.",
        )

    logger.info(
        f"Imóvel #{novo_id} '{dto.titulo}' criado na conta {conta.id} "
        f"por usuário {usuario_logado.id}"
    )

    criado = imovel_repo.obter_detalhe(novo_id)
    return ImovelResponse.de_imovel(criado)


# =============================================================================
# Detalhe
# =============================================================================

@router.get("/{id}", response_model=ImovelResponse)
@requer_autenticacao()
async def obter(
    request: Request,
    id: int,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Detalhe de um imóvel da conta (endereço + fotos); 403 se não for da conta."""
    assert usuario_logado is not None
    conta = _obter_conta_do_usuario(usuario_logado)
    _obter_imovel_da_conta(id, conta)  # valida ownership

    detalhe = imovel_repo.obter_detalhe(id)
    return ImovelResponse.de_imovel(detalhe)


# =============================================================================
# Atualização
# =============================================================================

@router.put("/{id}", response_model=ImovelResponse)
@requer_autenticacao()
async def atualizar(
    request: Request,
    id: int,
    dto: AtualizarImovelDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Atualiza um imóvel (+ endereço) da conta do corretor."""
    assert usuario_logado is not None
    conta = _obter_conta_do_usuario(usuario_logado)
    existente = _obter_imovel_da_conta(id, conta)

    atualizado = Imovel(
        id=id,
        conta_site_id=conta.id,
        titulo=dto.titulo,
        tipo=TipoImovel(dto.tipo),
        finalidade=FinalidadeImovel(dto.finalidade),
        preco=dto.preco,
        codigo=dto.codigo,
        slug=existente.slug or _gerar_slug(dto.titulo),
        descricao=dto.descricao,
        area=dto.area,
        quartos=dto.quartos,
        banheiros=dto.banheiros,
        vagas=dto.vagas,
        destaque=dto.destaque,
        status_publicacao=StatusImovel(dto.status_publicacao),
        endereco=_endereco_de_dto(dto.endereco),
    )
    imovel_repo.atualizar(atualizado)

    logger.info(f"Imóvel #{id} atualizado por usuário {usuario_logado.id}")

    detalhe = imovel_repo.obter_detalhe(id)
    return ImovelResponse.de_imovel(detalhe)


# =============================================================================
# Exclusão
# =============================================================================

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
@requer_autenticacao()
async def excluir(
    request: Request,
    id: int,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Exclui um imóvel da conta (endereço e fotos caem por ON DELETE CASCADE)."""
    assert usuario_logado is not None
    conta = _obter_conta_do_usuario(usuario_logado)
    _obter_imovel_da_conta(id, conta)  # valida ownership

    # Remover arquivos físicos das fotos antes de apagar os registros.
    for foto in foto_imovel_repo.obter_por_imovel(id):
        excluir_arquivo(foto.url_arquivo)

    imovel_repo.excluir(id)
    logger.info(f"Imóvel #{id} excluído por usuário {usuario_logado.id}")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# =============================================================================
# Publicação (toggle)
# =============================================================================

@router.patch("/{id}/publicacao", response_model=ImovelResponse)
@requer_autenticacao()
async def alternar_publicacao(
    request: Request,
    id: int,
    dto: Optional[AlterarStatusImovelDTO] = None,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Alterna a publicação do imóvel (Publicado/Oculto).

    Sem corpo, alterna em relação ao estado atual; com ``status_publicacao``
    no corpo, define o status explicitamente.
    """
    assert usuario_logado is not None
    conta = _obter_conta_do_usuario(usuario_logado)
    imovel = _obter_imovel_da_conta(id, conta)

    if dto is not None:
        novo_status = StatusImovel(dto.status_publicacao)
    elif imovel.status_publicacao == StatusImovel.PUBLICADO:
        novo_status = StatusImovel.OCULTO
    else:
        novo_status = StatusImovel.PUBLICADO

    imovel_repo.alterar_status_publicacao(id, novo_status)
    logger.info(
        f"Imóvel #{id} -> {novo_status.value} (usuário {usuario_logado.id})"
    )

    detalhe = imovel_repo.obter_detalhe(id)
    return ImovelResponse.de_imovel(detalhe)


# =============================================================================
# Fotos (1:N)
# =============================================================================

@router.post(
    "/{id}/fotos",
    status_code=status.HTTP_201_CREATED,
)
@requer_autenticacao()
async def enviar_foto(
    request: Request,
    id: int,
    arquivo: UploadFile = File(...),
    legenda: Optional[str] = Form(default=None),
    foto_principal: bool = Form(default=False),
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Upload (multipart) de uma foto do imóvel; salva em static/uploads/imoveis."""
    assert usuario_logado is not None
    checar_rate_limit(imovel_foto_limiter, request)
    conta = _obter_conta_do_usuario(usuario_logado)
    _obter_imovel_da_conta(id, conta)  # valida ownership

    erro = await validar_arquivo(
        arquivo, tipos_permitidos=TIPOS_IMAGEM, max_bytes=FOTO_MAX_BYTES
    )
    if erro:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=erro)

    caminho = await salvar_arquivo(
        arquivo, subdiretorio=SUBDIR_FOTOS, prefixo=str(id)
    )

    fotos_existentes = foto_imovel_repo.obter_por_imovel(id)
    # Primeira foto vira principal automaticamente.
    tornar_principal = foto_principal or len(fotos_existentes) == 0
    proxima_ordem = max((f.ordem for f in fotos_existentes), default=-1) + 1

    foto = FotoImovel(
        id=0,
        imovel_id=id,
        url_arquivo=caminho,
        ordem=proxima_ordem,
        foto_principal=tornar_principal,
        legenda=legenda,
    )
    foto_id = foto_imovel_repo.inserir(foto)
    if not foto_id:
        # Limpa o arquivo órfão se a gravação falhar.
        excluir_arquivo(caminho)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao registrar a foto. Tente novamente.",
        )

    # Garante exclusividade da principal.
    if tornar_principal:
        foto_imovel_repo.definir_principal(id, foto_id)

    logger.info(
        f"Foto #{foto_id} adicionada ao imóvel #{id} por usuário {usuario_logado.id}"
    )

    detalhe = imovel_repo.obter_detalhe(id)
    return ImovelResponse.de_imovel(detalhe)


@router.delete(
    "/{id}/fotos/{foto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
@requer_autenticacao()
async def remover_foto(
    request: Request,
    id: int,
    foto_id: int,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Remove uma foto do imóvel (registro + arquivo físico)."""
    assert usuario_logado is not None
    conta = _obter_conta_do_usuario(usuario_logado)
    _obter_imovel_da_conta(id, conta)  # valida ownership

    foto = foto_imovel_repo.obter_por_id(foto_id)
    if not foto or foto.imovel_id != id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Foto não encontrada.",
        )

    era_principal = foto.foto_principal
    foto_imovel_repo.excluir(foto_id)
    excluir_arquivo(foto.url_arquivo)

    # Se a principal foi removida, promove a primeira foto restante.
    if era_principal:
        restantes = foto_imovel_repo.obter_por_imovel(id)
        if restantes:
            foto_imovel_repo.definir_principal(id, restantes[0].id)

    logger.info(
        f"Foto #{foto_id} removida do imóvel #{id} por usuário {usuario_logado.id}"
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch(
    "/{id}/fotos/{foto_id}/principal",
    response_model=ImovelResponse,
)
@requer_autenticacao()
async def definir_foto_principal(
    request: Request,
    id: int,
    foto_id: int,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Define a foto principal do imóvel (zera o flag das demais)."""
    assert usuario_logado is not None
    conta = _obter_conta_do_usuario(usuario_logado)
    _obter_imovel_da_conta(id, conta)  # valida ownership

    foto = foto_imovel_repo.obter_por_id(foto_id)
    if not foto or foto.imovel_id != id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Foto não encontrada.",
        )

    foto_imovel_repo.definir_principal(id, foto_id)
    logger.info(
        f"Foto #{foto_id} definida como principal do imóvel #{id} "
        f"por usuário {usuario_logado.id}"
    )

    detalhe = imovel_repo.obter_detalhe(id)
    return ImovelResponse.de_imovel(detalhe)
