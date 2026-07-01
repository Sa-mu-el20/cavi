"""
DTOs de entrada (criação/edição) do módulo Característica/Comodidade.

Validação via Pydantic + validators reutilizáveis de ``dtos/validators.py``.
"""
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from dtos.validators import (
    validar_string_obrigatoria,
    validar_comprimento,
)


class _CaracteristicaBaseDTO(BaseModel):
    """Campos comuns de criação e edição de característica."""

    nome: str = Field(..., description="Nome da comodidade (ex: Piscina)")
    icone: Optional[str] = Field(default=None, description="Ícone/emoji opcional")

    _validar_nome = field_validator("nome")(
        validar_string_obrigatoria(
            nome_campo="Nome", tamanho_minimo=2, tamanho_maximo=60
        )
    )
    _validar_icone = field_validator("icone")(validar_comprimento(tamanho_maximo=20))


class CriarCaracteristicaDTO(_CaracteristicaBaseDTO):
    """DTO de criação de característica."""


class AtualizarCaracteristicaDTO(_CaracteristicaBaseDTO):
    """DTO de edição de característica."""