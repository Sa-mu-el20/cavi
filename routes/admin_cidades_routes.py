"""Rotas administrativas para gerenciamento de Cidades."""

# =============================================================================
# Imports
# =============================================================================

from typing import Optional

from fastapi import APIRouter, Form, Request, status
from fastapi.responses import RedirectResponse
from pydantic import ValidationError

from dtos.cidade_dto import CriarCidadeDTO, AlterarCidadeDTO
from model.cidade_model import Cidade
from model.usuario_logado_model import UsuarioLogado
from repo import cidade_repo
from util.auth_decorator import requer_autenticacao
from util.exceptions import ErroValidacaoFormulario
from util.flash_messages import informar_sucesso, informar_erro
from util.logger_config import logger
from util.perfis import Perfil
from util.rate_limiter import DynamicRateLimiter, obter_identificador_cliente
from util.repository_helpers import obter_ou_404
from util.template_util import criar_templates

# =============================================================================
# Configuração do Router
# =============================================================================

router = APIRouter(prefix="/admin/cidades")
templates = criar_templates()

# =============================================================================
# Rate Limiter
# =============================================================================

cidade_limiter = DynamicRateLimiter(
    chave_max="rate_limit_admin_cidade_max",
    chave_minutos="rate_limit_admin_cidade_minutos",
    padrao_max=30,
    padrao_minutos=1,
    nome="admin_cidade",
)


@router.get("/listar")
@requer_autenticacao([Perfil.ADMIN.value])
async def listar(request: Request, usuario_logado: Optional[UsuarioLogado] = None):
    """Lista todas as cidades."""
    assert usuario_logado is not None
    cidades = cidade_repo.obter_todos()
    return templates.TemplateResponse(
        "admin/cidades/listar.html",
        {"request": request, "cidades": cidades, "usuario_logado": usuario_logado},
    )


@router.get("/cadastrar")
@requer_autenticacao([Perfil.ADMIN.value])
async def get_cadastrar(request: Request, usuario_logado: Optional[UsuarioLogado] = None):
    """Exibe formulário de cadastro."""
    assert usuario_logado is not None
    return templates.TemplateResponse(
        "admin/cidades/cadastrar.html",
        {"request": request, "usuario_logado": usuario_logado},
    )


@router.post("/cadastrar")
@requer_autenticacao([Perfil.ADMIN.value])
async def post_cadastrar(
    request: Request,
    nome: str = Form(...),
    uf: str = Form(...),
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Cadastra uma nova cidade."""
    assert usuario_logado is not None

    ip = obter_identificador_cliente(request)
    if not cidade_limiter.verificar(ip):
        informar_erro(request, "Muitas operações. Aguarde um momento.")
        return RedirectResponse("/admin/cidades/listar", status_code=status.HTTP_303_SEE_OTHER)

    dados_formulario: dict = {"nome": nome, "uf": uf}

    try:
        dto = CriarCidadeDTO(nome=nome, uf=uf)

        nova = Cidade(
            id=0,
            nome=dto.nome,
            uf=dto.uf,
        )
        id_criado = cidade_repo.inserir(nova)
        if id_criado:
            informar_sucesso(request, "Cidade cadastrada com sucesso!")
            logger.info(f"Cidade #{id_criado} criada por admin {usuario_logado.id}")
        else:
            informar_erro(request, "Erro ao cadastrar cidade.")
    except ValidationError as e:
        raise ErroValidacaoFormulario(
            validation_error=e,
            template_path="admin/cidades/cadastrar.html",
            dados_formulario=dados_formulario,
        )

    return RedirectResponse("/admin/cidades/listar", status_code=status.HTTP_303_SEE_OTHER)


@router.get("/editar/{id}")
@requer_autenticacao([Perfil.ADMIN.value])
async def get_editar(request: Request, id: int, usuario_logado: Optional[UsuarioLogado] = None):
    """Exibe formulário de edição."""
    assert usuario_logado is not None

    item = obter_ou_404(
        cidade_repo.obter_por_id(id),
        request,
        "Cidade não encontrada",
        "/admin/cidades/listar",
    )
    if isinstance(item, RedirectResponse):
        return item

    dados = item.__dict__.copy()
    return templates.TemplateResponse(
        "admin/cidades/editar.html",
        {
            "request": request,
            "cidade": item,
            "dados": dados,
            "usuario_logado": usuario_logado,
        },
    )


@router.post("/editar/{id}")
@requer_autenticacao([Perfil.ADMIN.value])
async def post_editar(
    request: Request,
    id: int,
    nome: str = Form(...),
    uf: str = Form(...),
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Altera uma cidade."""
    assert usuario_logado is not None

    ip = obter_identificador_cliente(request)
    if not cidade_limiter.verificar(ip):
        informar_erro(request, "Muitas operações. Aguarde um momento.")
        return RedirectResponse("/admin/cidades/listar", status_code=status.HTTP_303_SEE_OTHER)

    item = obter_ou_404(
        cidade_repo.obter_por_id(id),
        request,
        "Cidade não encontrada",
        "/admin/cidades/listar",
    )
    if isinstance(item, RedirectResponse):
        return item

    dados_formulario: dict = {"id": id, "nome": nome, "uf": uf}

    try:
        dto = AlterarCidadeDTO(nome=nome, uf=uf)

        atualizado = Cidade(
            id=id,
            nome=dto.nome,
            uf=dto.uf,
        )
        if cidade_repo.atualizar(atualizado):
            informar_sucesso(request, "Cidade atualizada com sucesso!")
            logger.info(f"Cidade #{id} alterada por admin {usuario_logado.id}")
        else:
            informar_erro(request, "Erro ao atualizar cidade.")
    except ValidationError as e:
        dados_formulario["cidade"] = item
        raise ErroValidacaoFormulario(
            validation_error=e,
            template_path="admin/cidades/editar.html",
            dados_formulario=dados_formulario,
        )

    return RedirectResponse("/admin/cidades/listar", status_code=status.HTTP_303_SEE_OTHER)


@router.post("/excluir/{id}")
@requer_autenticacao([Perfil.ADMIN.value])
async def post_excluir(request: Request, id: int, usuario_logado: Optional[UsuarioLogado] = None):
    """Exclui uma cidade."""
    assert usuario_logado is not None

    if cidade_repo.excluir(id):
        informar_sucesso(request, "Cidade excluída com sucesso!")
        logger.info(f"Cidade #{id} excluída por admin {usuario_logado.id}")
    else:
        informar_erro(request, "Erro ao excluir cidade.")

    return RedirectResponse("/admin/cidades/listar", status_code=status.HTTP_303_SEE_OTHER)
