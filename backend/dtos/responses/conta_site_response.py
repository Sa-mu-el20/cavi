"""Schemas de resposta do módulo de ContaSite (vitrine pública do corretor)."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from model.conta_site_model import ContaSite


class ContaSiteResponse(BaseModel):
    """Representação completa de uma conta de vitrine (dono/admin)."""

    id: int
    usuario_id: int
    nome_publico: str
    slug: str
    descricao: Optional[str] = None
    whatsapp: Optional[str] = None
    creci: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None
    bairro: Optional[str] = None
    cor: str = Field(..., description="Cor de destaque da vitrine (hexadecimal)")
    logo: Optional[str] = Field(
        default=None, description="Caminho do logo em /static/uploads ou null"
    )
    status: str = Field(..., description="Status da conta (Ativo|Inativo)")
    data_cadastro: Optional[datetime] = None
    data_atualizacao: Optional[datetime] = None
    usuario_nome: Optional[str] = None
    usuario_email: Optional[str] = None

    @classmethod
    def de_conta(cls, conta: ContaSite) -> "ContaSiteResponse":
        """Constrói o response a partir da entidade de domínio."""
        return cls(
            id=conta.id,
            usuario_id=conta.usuario_id,
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
            status=conta.status.value,
            data_cadastro=conta.data_cadastro,
            data_atualizacao=conta.data_atualizacao,
            usuario_nome=conta.usuario_nome,
            usuario_email=conta.usuario_email,
        )


class CorretorAdminResponse(BaseModel):
    """
    Item da listagem administrativa de corretores (usuário + vitrine).

    Agrega dados do usuário corretor, da sua vitrine (``ContaSite``) e a
    quantidade de imóveis cadastrados, para a visão de gestão do admin.
    """

    conta_id: int = Field(..., description="ID da ContaSite (vitrine)")
    usuario_id: int = Field(..., description="ID do usuário corretor")
    usuario_nome: Optional[str] = Field(
        default=None, description="Nome do usuário corretor"
    )
    usuario_email: Optional[str] = Field(
        default=None, description="E-mail do usuário corretor"
    )
    nome_publico: str = Field(..., description="Nome público da vitrine")
    slug: str = Field(..., description="Slug usado em /v/{slug}")
    cidade: Optional[str] = None
    uf: Optional[str] = None
    status: str = Field(..., description="Status da vitrine (Ativo|Inativo)")
    qtd_imoveis: int = Field(
        ..., description="Quantidade de imóveis cadastrados na vitrine"
    )
    data_cadastro: Optional[datetime] = None
    data_atualizacao: Optional[datetime] = None

    @classmethod
    def de_conta(cls, conta: ContaSite, qtd_imoveis: int) -> "CorretorAdminResponse":
        """Constrói o item a partir da entidade e da contagem de imóveis."""
        return cls(
            conta_id=conta.id,
            usuario_id=conta.usuario_id,
            usuario_nome=conta.usuario_nome,
            usuario_email=conta.usuario_email,
            nome_publico=conta.nome_publico,
            slug=conta.slug,
            cidade=conta.cidade,
            uf=conta.uf,
            status=conta.status.value,
            qtd_imoveis=qtd_imoveis,
            data_cadastro=conta.data_cadastro,
            data_atualizacao=conta.data_atualizacao,
        )


class ContaSiteResumoResponse(BaseModel):
    """
    Resumo público de uma vitrine, usado na home (listagem de corretores).

    Expõe apenas campos seguros para exibição pública — sem e-mail do
    usuário nem datas internas.
    """

    nome_publico: str
    slug: str
    descricao: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None
    bairro: Optional[str] = None
    cor: str = Field(..., description="Cor de destaque da vitrine (hexadecimal)")
    logo: Optional[str] = Field(
        default=None, description="Caminho do logo em /static/uploads ou null"
    )

    @classmethod
    def de_conta(cls, conta: ContaSite) -> "ContaSiteResumoResponse":
        """Constrói o resumo público a partir da entidade de domínio."""
        return cls(
            nome_publico=conta.nome_publico,
            slug=conta.slug,
            descricao=conta.descricao,
            cidade=conta.cidade,
            uf=conta.uf,
            bairro=conta.bairro,
            cor=conta.cor,
            logo=conta.logo,
        )
