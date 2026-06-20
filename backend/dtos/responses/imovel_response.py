"""
Schemas de resposta do módulo Imóvel.

- ``EnderecoImovelResponse``: endereço 1:1.
- ``FotoImovelResponse``: foto 1:N.
- ``ImovelResponse``: detalhe completo (endereço + fotos[]).
- ``ImovelResumoResponse``: payload enxuto para cards/listagens.

Tipos espelhados em ``frontend/src/lib/types.ts`` e validação Zod em
``frontend/src/lib/schemas.ts``.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from model.imovel_model import Imovel
from model.endereco_imovel_model import EnderecoImovel
from model.foto_imovel_model import FotoImovel


class EnderecoImovelResponse(BaseModel):
    """Endereço de um imóvel."""

    id: int
    imovel_id: int
    cep: Optional[str] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None
    complemento: Optional[str] = None

    @classmethod
    def de_endereco(cls, endereco: EnderecoImovel) -> "EnderecoImovelResponse":
        return cls(
            id=endereco.id,
            imovel_id=endereco.imovel_id,
            cep=endereco.cep,
            logradouro=endereco.logradouro,
            numero=endereco.numero,
            bairro=endereco.bairro,
            cidade=endereco.cidade,
            uf=endereco.uf,
            complemento=endereco.complemento,
        )


class FotoImovelResponse(BaseModel):
    """Foto de um imóvel."""

    id: int
    imovel_id: int
    url_arquivo: str
    ordem: int = 0
    foto_principal: bool = False
    legenda: Optional[str] = None

    @classmethod
    def de_foto(cls, foto: FotoImovel) -> "FotoImovelResponse":
        return cls(
            id=foto.id,
            imovel_id=foto.imovel_id,
            url_arquivo=foto.url_arquivo,
            ordem=foto.ordem,
            foto_principal=foto.foto_principal,
            legenda=foto.legenda,
        )


class ImovelResponse(BaseModel):
    """Detalhe completo de um imóvel (com endereço 1:1 e fotos 1:N)."""

    id: int
    conta_site_id: int
    codigo: Optional[str] = None
    titulo: str
    slug: Optional[str] = None
    descricao: Optional[str] = None
    tipo: str = Field(..., description="Tipo do imóvel")
    finalidade: str = Field(..., description="Finalidade (Venda/Aluguel)")
    preco: float
    area: Optional[float] = None
    quartos: Optional[int] = None
    banheiros: Optional[int] = None
    vagas: Optional[int] = None
    destaque: bool = False
    status_publicacao: str = Field(..., description="Status de publicação")
    data_cadastro: Optional[datetime] = None
    data_atualizacao: Optional[datetime] = None
    endereco: Optional[EnderecoImovelResponse] = None
    fotos: list[FotoImovelResponse] = Field(default_factory=list)

    @classmethod
    def de_imovel(cls, imovel: Imovel) -> "ImovelResponse":
        """Constrói o response a partir da entidade (use após ``obter_detalhe``)."""
        return cls(
            id=imovel.id,
            conta_site_id=imovel.conta_site_id,
            codigo=imovel.codigo,
            titulo=imovel.titulo,
            slug=imovel.slug,
            descricao=imovel.descricao,
            tipo=imovel.tipo.value,
            finalidade=imovel.finalidade.value,
            preco=imovel.preco,
            area=imovel.area,
            quartos=imovel.quartos,
            banheiros=imovel.banheiros,
            vagas=imovel.vagas,
            destaque=imovel.destaque,
            status_publicacao=imovel.status_publicacao.value,
            data_cadastro=imovel.data_cadastro,
            data_atualizacao=imovel.data_atualizacao,
            endereco=(
                EnderecoImovelResponse.de_endereco(imovel.endereco)
                if imovel.endereco is not None
                else None
            ),
            fotos=[FotoImovelResponse.de_foto(f) for f in imovel.fotos],
        )


class ImovelResumoResponse(BaseModel):
    """Payload enxuto para cards/listagens (sem descrição nem fotos completas)."""

    id: int
    conta_site_id: int
    codigo: Optional[str] = None
    titulo: str
    slug: Optional[str] = None
    tipo: str
    finalidade: str
    preco: float
    area: Optional[float] = None
    quartos: Optional[int] = None
    banheiros: Optional[int] = None
    vagas: Optional[int] = None
    destaque: bool = False
    status_publicacao: str
    bairro: Optional[str] = Field(default=None, description="Bairro (do endereço, quando carregado)")
    cidade: Optional[str] = Field(default=None, description="Cidade (do endereço, quando carregado)")
    foto_principal: Optional[str] = Field(
        default=None, description="URL da foto principal (quando carregada)"
    )

    @classmethod
    def de_imovel(cls, imovel: Imovel) -> "ImovelResumoResponse":
        """Resumo a partir da entidade; usa agregados (endereço/fotos) se presentes."""
        bairro = imovel.endereco.bairro if imovel.endereco is not None else None
        cidade = imovel.endereco.cidade if imovel.endereco is not None else None

        foto_principal: Optional[str] = None
        if imovel.fotos:
            principal = next((f for f in imovel.fotos if f.foto_principal), None)
            foto_principal = (principal or imovel.fotos[0]).url_arquivo

        return cls(
            id=imovel.id,
            conta_site_id=imovel.conta_site_id,
            codigo=imovel.codigo,
            titulo=imovel.titulo,
            slug=imovel.slug,
            tipo=imovel.tipo.value,
            finalidade=imovel.finalidade.value,
            preco=imovel.preco,
            area=imovel.area,
            quartos=imovel.quartos,
            banheiros=imovel.banheiros,
            vagas=imovel.vagas,
            destaque=imovel.destaque,
            status_publicacao=imovel.status_publicacao.value,
            bairro=bairro,
            cidade=cidade,
            foto_principal=foto_principal,
        )
