"""
DTOs de entrada (criação/edição) do módulo Imóvel.

Validação via Pydantic + validators reutilizáveis de ``dtos/validators.py``.
Validators levantam ``ValueError`` -> tratado como 422 pelos handlers globais.
O endereço é aninhado (``EnderecoImovelDTO``) e opcional.
"""
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from dtos.validators import (
    validar_string_obrigatoria,
    validar_comprimento,
    validar_tipo,
    validar_inteiro_range,
)
from model.imovel_model import StatusImovel, FinalidadeImovel, TipoImovel


class EnderecoImovelDTO(BaseModel):
    """Endereço aninhado do imóvel. Todos os campos opcionais."""

    cep: Optional[str] = Field(default=None, description="CEP (somente dígitos ou formatado)")
    logradouro: Optional[str] = Field(default=None, description="Logradouro")
    numero: Optional[str] = Field(default=None, description="Número")
    bairro: Optional[str] = Field(default=None, description="Bairro")
    cidade: Optional[str] = Field(default=None, description="Cidade")
    uf: Optional[str] = Field(default=None, description="UF (2 letras)")
    complemento: Optional[str] = Field(default=None, description="Complemento")

    _validar_logradouro = field_validator("logradouro")(
        validar_comprimento(tamanho_maximo=200)
    )
    _validar_bairro = field_validator("bairro")(validar_comprimento(tamanho_maximo=100))
    _validar_cidade = field_validator("cidade")(validar_comprimento(tamanho_maximo=100))
    _validar_complemento = field_validator("complemento")(
        validar_comprimento(tamanho_maximo=200)
    )

    @field_validator("uf")
    @classmethod
    def _validar_uf(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        valor = v.strip().upper()
        if len(valor) != 2 or not valor.isalpha():
            raise ValueError("UF deve ter exatamente 2 letras.")
        return valor


class _ImovelBaseDTO(BaseModel):
    """Campos comuns de criação e edição de imóvel."""

    titulo: str = Field(..., description="Título do anúncio")
    tipo: str = Field(..., description="Tipo do imóvel")
    finalidade: str = Field(..., description="Finalidade (Venda/Aluguel)")
    preco: float = Field(..., description="Preço em reais")
    codigo: Optional[str] = Field(default=None, description="Código interno do imóvel")
    descricao: Optional[str] = Field(default=None, description="Descrição completa")
    area: Optional[float] = Field(default=None, description="Área em m²")
    quartos: Optional[int] = Field(default=None, description="Quantidade de quartos")
    banheiros: Optional[int] = Field(default=None, description="Quantidade de banheiros")
    vagas: Optional[int] = Field(default=None, description="Vagas de garagem")
    destaque: bool = Field(default=False, description="Exibir em destaque")
    status_publicacao: str = Field(
        default=StatusImovel.OCULTO.value, description="Status de publicação"
    )
    endereco: Optional[EnderecoImovelDTO] = Field(
        default=None, description="Endereço do imóvel (1:1, opcional)"
    )

    _validar_titulo = field_validator("titulo")(
        validar_string_obrigatoria(
            nome_campo="Título", tamanho_minimo=5, tamanho_maximo=200
        )
    )
    _validar_codigo = field_validator("codigo")(validar_comprimento(tamanho_maximo=50))
    _validar_descricao = field_validator("descricao")(
        validar_comprimento(tamanho_maximo=5000)
    )
    _validar_tipo = field_validator("tipo")(validar_tipo("Tipo", TipoImovel))
    _validar_finalidade = field_validator("finalidade")(
        validar_tipo("Finalidade", FinalidadeImovel)
    )
    _validar_status = field_validator("status_publicacao")(
        validar_tipo("Status de publicação", StatusImovel)
    )
    _validar_quartos = field_validator("quartos")(
        validar_inteiro_range(0, 100, "Quartos")
    )
    _validar_banheiros = field_validator("banheiros")(
        validar_inteiro_range(0, 100, "Banheiros")
    )
    _validar_vagas = field_validator("vagas")(validar_inteiro_range(0, 100, "Vagas"))

    @field_validator("preco")
    @classmethod
    def _validar_preco(cls, v: float) -> float:
        if v is None or v <= 0:
            raise ValueError("Preço deve ser maior que zero.")
        return v

    @field_validator("area")
    @classmethod
    def _validar_area(cls, v: Optional[float]) -> Optional[float]:
        if v is None:
            return None
        if v <= 0:
            raise ValueError("Área deve ser maior que zero.")
        return v


class CriarImovelDTO(_ImovelBaseDTO):
    """DTO de criação de imóvel (com endereço aninhado opcional)."""


class AtualizarImovelDTO(_ImovelBaseDTO):
    """DTO de edição de imóvel (mesmos campos da criação)."""


class AlterarStatusImovelDTO(BaseModel):
    """DTO para alternar publicação (Publicado/Oculto)."""

    status_publicacao: str = Field(..., description="Novo status de publicação")

    _validar_status = field_validator("status_publicacao")(
        validar_tipo("Status de publicação", StatusImovel)
    )


class FotoImovelDTO(BaseModel):
    """DTO para registrar/atualizar metadados de uma foto do imóvel."""

    url_arquivo: str = Field(..., description="Caminho/URL do arquivo da foto")
    ordem: int = Field(default=0, description="Ordem de exibição")
    foto_principal: bool = Field(default=False, description="Define como foto principal")
    legenda: Optional[str] = Field(default=None, description="Legenda da foto")

    _validar_url = field_validator("url_arquivo")(
        validar_string_obrigatoria(nome_campo="Arquivo", tamanho_maximo=500)
    )
    _validar_legenda = field_validator("legenda")(validar_comprimento(tamanho_maximo=200))
    _validar_ordem = field_validator("ordem")(validar_inteiro_range(0, 9999, "Ordem"))
