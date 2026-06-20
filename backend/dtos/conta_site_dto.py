import re
import unicodedata
from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator

from dtos.validators import (
    validar_string_obrigatoria,
    validar_comprimento,
)


# Cor padrão de destaque da vitrine (mesmo default do banco/model).
COR_PADRAO = "#d97a2b"

# Regex de cor hexadecimal (#rgb ou #rrggbb).
_HEX_COR_REGEX = re.compile(r"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")

# Regex de slug normalizado (letras minúsculas, números e hífens).
_SLUG_REGEX = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

# UFs brasileiras válidas.
_UFS_VALIDAS = {
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO",
}


def gerar_slug(texto: str) -> str:
    """
    Normaliza um texto em um slug URL-friendly.

    Remove acentos, troca não-alfanuméricos por hífens e colapsa hífens
    repetidos. Ex: "João Corretor Imóveis" -> "joao-corretor-imoveis".

    Args:
        texto: Texto de origem (ex: nome público ou slug informado).

    Returns:
        Slug normalizado (pode ser string vazia se o texto não tiver
        caracteres aproveitáveis).
    """
    # Remove acentos
    normalizado = unicodedata.normalize("NFKD", texto)
    sem_acento = normalizado.encode("ascii", "ignore").decode("ascii")
    # Minúsculas e troca de não-alfanuméricos por hífen
    minusculo = sem_acento.lower()
    com_hifens = re.sub(r"[^a-z0-9]+", "-", minusculo)
    # Remove hífens das bordas e colapsa repetidos
    return com_hifens.strip("-")


class AlterarStatusContaDTO(BaseModel):
    """
    DTO para a ação administrativa de ativar/inativar uma ContaSite.

    Aceita apenas os valores do enum ``StatusConta`` (Ativo|Inativo).
    """

    status: str = Field(..., description="Novo status da vitrine (Ativo|Inativo)")

    @field_validator("status")
    @classmethod
    def _validar_status(cls, v: str) -> str:
        from util.status_conta import StatusConta

        valor = (v or "").strip()
        if not StatusConta.existe(valor):
            validos = ", ".join(StatusConta.valores())
            raise ValueError(f"Status inválido. Use um de: {validos}.")
        return valor


class ContaSiteDTO(BaseModel):
    """
    DTO de criação/edição de uma ContaSite (vitrine pública do corretor).

    O ``slug`` é opcional na entrada: se não informado, é derivado do
    ``nome_publico``; se informado, é normalizado. O status não é gerenciado
    por este DTO (use o fluxo administrativo de ativar/inativar).
    """

    nome_publico: str = Field(..., description="Nome público exibido na vitrine")
    slug: Optional[str] = Field(
        default=None,
        description="Slug único usado em /v/{slug}; derivado do nome se omitido",
    )
    descricao: Optional[str] = Field(
        default=None, description="Descrição/apresentação do corretor"
    )
    whatsapp: Optional[str] = Field(
        default=None, description="WhatsApp de contato (dígitos ou formato livre)"
    )
    creci: Optional[str] = Field(default=None, description="Número do CRECI")
    cidade: Optional[str] = Field(default=None, description="Cidade de atuação")
    uf: Optional[str] = Field(default=None, description="UF de atuação (2 letras)")
    bairro: Optional[str] = Field(default=None, description="Bairro de atuação")
    cor: str = Field(
        default=COR_PADRAO,
        description="Cor de destaque da vitrine em hexadecimal (ex #d97a2b)",
    )

    _validar_nome_publico = field_validator("nome_publico")(
        validar_string_obrigatoria(
            nome_campo="Nome público", tamanho_minimo=3, tamanho_maximo=120
        )
    )

    _validar_descricao = field_validator("descricao")(
        validar_comprimento(tamanho_maximo=2000)
    )

    @field_validator("whatsapp", "creci", "cidade", "bairro")
    @classmethod
    def _normalizar_opcionais(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        valor = v.strip()
        return valor or None

    @field_validator("uf")
    @classmethod
    def _validar_uf(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        valor = v.strip().upper()
        if not valor:
            return None
        if valor not in _UFS_VALIDAS:
            raise ValueError("UF inválida. Use a sigla de 2 letras (ex: ES, SP).")
        return valor

    @field_validator("cor")
    @classmethod
    def _validar_cor(cls, v: Optional[str]) -> str:
        if v is None or not str(v).strip():
            return COR_PADRAO
        valor = str(v).strip().lower()
        if not _HEX_COR_REGEX.match(valor):
            raise ValueError(
                "Cor deve ser um hexadecimal válido (ex: #d97a2b ou #abc)."
            )
        return valor

    @model_validator(mode="after")
    def _normalizar_slug(self) -> "ContaSiteDTO":
        """
        Deriva o slug do nome público quando ausente e o valida/normaliza
        quando presente. Garante um slug final no formato URL-friendly.
        """
        bruto = (self.slug or "").strip()
        if not bruto:
            bruto = self.nome_publico

        slug_normalizado = gerar_slug(bruto)

        if not slug_normalizado:
            raise ValueError(
                "Não foi possível gerar um slug válido. "
                "Informe um slug com letras ou números."
            )

        if len(slug_normalizado) > 128:
            raise ValueError("Slug deve ter no máximo 128 caracteres.")

        if not _SLUG_REGEX.match(slug_normalizado):
            raise ValueError(
                "Slug deve conter apenas letras minúsculas, números e hífens."
            )

        self.slug = slug_normalizado
        return self
