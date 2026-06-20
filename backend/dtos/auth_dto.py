from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator
from dtos.validators import (
    validar_email,
    validar_tipo,
    validar_senha_forte,
    validar_nome_pessoa,
    validar_string_obrigatoria,
    validar_senhas_coincidem,
    validar_cpf,
    validar_telefone_br,
)
from util.perfis import Perfil


# UFs brasileiras válidas (sigla de 2 letras).
_UFS_VALIDAS = {
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO",
}


class LoginDTO(BaseModel):
    email: str = Field(..., description="E-mail do usuário")
    senha: str = Field(..., description="Senha do usuário")

    _validar_email = field_validator("email")(validar_email())
    _validar_senha = field_validator("senha")(
        validar_string_obrigatoria("Senha", tamanho_minimo=1)
    )


class CadastroDTO(BaseModel):
    perfil: str = Field(..., description="Perfil/Role do usuário")
    nome: str = Field(..., description="Nome completo do usuário")
    email: str = Field(..., description="E-mail do usuário")
    senha: str = Field(..., description="Senha do usuário")
    confirmar_senha: str = Field(..., description="Confirmação da senha")

    _validar_perfil = field_validator("perfil")(validar_tipo("Perfil", Perfil))
    _validar_nome = field_validator("nome")(validar_nome_pessoa())
    _validar_email = field_validator("email")(validar_email())
    _validar_senha = field_validator("senha")(validar_senha_forte())
    _validar_confirmar = field_validator("confirmar_senha")(validar_senha_forte())

    _validar_senhas_match = model_validator(mode="after")(validar_senhas_coincidem())


class CadastroCorretorDTO(BaseModel):
    """
    DTO de auto-cadastro de um corretor.

    Cria, em uma única operação, o ``Usuario`` (perfil Corretor) e a sua
    ``ContaSite`` (vitrine pública). O ``slug`` da vitrine é derivado do
    ``nome_publico`` na rota (com garantia de unicidade), não vindo no DTO.
    """

    # Dados do usuário/corretor
    nome: str = Field(..., description="Nome completo do corretor")
    email: str = Field(..., description="E-mail de acesso do corretor")
    senha: str = Field(..., description="Senha de acesso do corretor")
    cpf: str = Field(..., description="CPF do corretor (apenas dígitos ou formatado)")
    telefone: str = Field(..., description="Telefone do corretor")
    creci: str = Field(..., description="Número do CRECI do corretor")

    # Dados da vitrine (ContaSite)
    nome_publico: str = Field(..., description="Nome público exibido na vitrine")
    cidade: str = Field(..., description="Cidade de atuação")
    uf: str = Field(..., description="UF de atuação (sigla de 2 letras)")
    whatsapp: Optional[str] = Field(
        default=None, description="WhatsApp de contato (dígitos ou formato livre)"
    )

    _validar_nome = field_validator("nome")(validar_nome_pessoa())
    _validar_email = field_validator("email")(validar_email())
    _validar_senha = field_validator("senha")(validar_senha_forte())
    _validar_cpf = field_validator("cpf")(validar_cpf())
    _validar_telefone = field_validator("telefone")(validar_telefone_br())
    _validar_creci = field_validator("creci")(
        validar_string_obrigatoria(nome_campo="CRECI", tamanho_minimo=2, tamanho_maximo=30)
    )
    _validar_nome_publico = field_validator("nome_publico")(
        validar_string_obrigatoria(
            nome_campo="Nome público", tamanho_minimo=3, tamanho_maximo=120
        )
    )
    _validar_cidade = field_validator("cidade")(
        validar_string_obrigatoria(nome_campo="Cidade", tamanho_minimo=2, tamanho_maximo=120)
    )

    @field_validator("uf")
    @classmethod
    def _validar_uf(cls, v: str) -> str:
        valor = (v or "").strip().upper()
        if not valor:
            raise ValueError("UF é obrigatória.")
        if valor not in _UFS_VALIDAS:
            raise ValueError("UF inválida. Use a sigla de 2 letras (ex: ES, SP).")
        return valor

    @field_validator("whatsapp")
    @classmethod
    def _normalizar_whatsapp(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        valor = v.strip()
        return valor or None


class EsqueciSenhaDTO(BaseModel):
    email: str = Field(..., description="E-mail cadastrado do usuário")

    _validar_email = field_validator("email")(validar_email())


class RedefinirSenhaDTO(BaseModel):
    token: str = Field(..., description="Token de redefinição recebido por e-mail")
    senha: str = Field(..., description="Nova senha do usuário")
    confirmar_senha: str = Field(..., description="Confirmação da nova senha")

    _validar_token = field_validator("token")(
        validar_string_obrigatoria("Token", tamanho_minimo=1)
    )
    _validar_senha = field_validator("senha")(validar_senha_forte())
    _validar_confirmar = field_validator("confirmar_senha")(validar_senha_forte())

    _validar_senhas_match = model_validator(mode="after")(validar_senhas_coincidem())
