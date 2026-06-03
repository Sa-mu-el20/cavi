import re

from pydantic import BaseModel, Field, field_validator

from dtos.validators import validar_string_obrigatoria


def _validar_uf(valor: str) -> str:
    """Valida UF (sigla do estado brasileiro) — exatamente 2 letras maiúsculas."""
    valor = valor.strip().upper()
    if not valor:
        raise ValueError("UF é obrigatória.")
    if not re.match(r'^[A-Z]{2}$', valor):
        raise ValueError("UF deve conter exatamente 2 letras (ex: SP, RJ, MG).")
    return valor


class CriarCidadeDTO(BaseModel):
    """DTO para criação de Cidade."""
    nome: str = Field(..., description="Nome da cidade")
    uf: str = Field(..., description="UF (sigla do estado)")

    _validar_nome = field_validator("nome")(
        validar_string_obrigatoria(nome_campo="Nome", tamanho_minimo=3, tamanho_maximo=200)
    )
    _validar_uf = field_validator("uf")(_validar_uf)


class AlterarCidadeDTO(CriarCidadeDTO):
    """DTO para alteração de Cidade — mesmos campos da criação."""
    pass
