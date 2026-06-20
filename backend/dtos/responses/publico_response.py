"""
Schemas de resposta dos endpoints PÚBLICOS (catálogo do corretor).

Estes payloads expõem APENAS dados seguros de contas ``Ativo`` e imóveis
``Publicado`` — sem e-mail do usuário, sem datas internas e sem campos
administrativos. São consumidos pelas páginas públicas do SPA (Home e
``/v/{slug}``).

- ``CorretorCatalogoResponse``: card de corretor na Home/lista de catálogos
  (inclui ``whatsapp``, ``creci`` e a contagem de imóveis publicados
  ``qtd_imoveis_publicados``).
- ``CatalogoPublicoResponse``: dados públicos da conta para o cabeçalho do
  catálogo, incluindo ``whatsapp`` e ``creci`` (front gera o link ``wa.me``).
- ``ImovelPublicoDetalheResponse``: detalhe de um imóvel publicado já
  acompanhado dos dados do catálogo (para o botão de WhatsApp).

Tipos espelhados em ``frontend/src/lib/types.ts`` e validação Zod em
``frontend/src/lib/schemas.ts``.
"""
from typing import Optional

from pydantic import BaseModel, Field

from dtos.responses.imovel_response import ImovelResponse
from model.conta_site_model import ContaSite


class CorretorCatalogoResponse(BaseModel):
    """Resumo de um catálogo ativo para a listagem de corretores na Home."""

    nome_publico: str
    slug: str
    descricao: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None
    bairro: Optional[str] = None
    whatsapp: Optional[str] = None
    creci: Optional[str] = None
    cor: str = Field(..., description="Cor de destaque do catálogo (hexadecimal)")
    logo: Optional[str] = Field(
        default=None, description="Caminho do logo em /static/uploads ou null"
    )
    qtd_imoveis_publicados: int = Field(
        ..., description="Quantidade de imóveis publicados neste catálogo"
    )

    @classmethod
    def de_conta(
        cls, conta: ContaSite, qtd_imoveis_publicados: int
    ) -> "CorretorCatalogoResponse":
        """Constrói o resumo público a partir da entidade e da contagem."""
        return cls(
            nome_publico=conta.nome_publico,
            slug=conta.slug,
            descricao=conta.descricao,
            cidade=conta.cidade,
            uf=conta.uf,
            bairro=conta.bairro,
            whatsapp=conta.whatsapp,
            creci=conta.creci,
            cor=conta.cor,
            logo=conta.logo,
            qtd_imoveis_publicados=qtd_imoveis_publicados,
        )


class CatalogoPublicoResponse(BaseModel):
    """
    Dados públicos de uma conta de catálogo (cabeçalho de ``/v/{slug}``).

    Inclui ``whatsapp`` e ``creci`` (necessários para o link ``wa.me`` e a
    identificação do corretor). Não expõe e-mail do usuário nem campos
    administrativos.
    """

    nome_publico: str
    slug: str
    descricao: Optional[str] = None
    whatsapp: Optional[str] = None
    creci: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None
    bairro: Optional[str] = None
    cor: str = Field(..., description="Cor de destaque do catálogo (hexadecimal)")
    logo: Optional[str] = Field(
        default=None, description="Caminho do logo em /static/uploads ou null"
    )

    @classmethod
    def de_conta(cls, conta: ContaSite) -> "CatalogoPublicoResponse":
        """Constrói os dados públicos a partir da entidade de domínio."""
        return cls(
            nome_publico=conta.nome_publico,
            slug=conta.slug,
            descricao=conta.descricao,
            whatsapp=conta.whatsapp,
            creci=conta.creci,
            cidade=conta.cidade,
            uf=conta.uf,
            bairro=conta.bairro,
            cor=conta.cor,
            logo=conta.logo,
        )


class ImovelPublicoDetalheResponse(BaseModel):
    """
    Detalhe público de um imóvel publicado, com os dados do catálogo.

    Reúne o ``ImovelResponse`` completo (endereço 1:1 + fotos 1:N) e a
    ``CatalogoPublicoResponse`` correspondente, para que o front possa montar o
    botão de WhatsApp sem uma segunda chamada.
    """

    imovel: ImovelResponse
    catalogo: CatalogoPublicoResponse
