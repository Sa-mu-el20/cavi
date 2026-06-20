"""
Enum centralizado para o status de uma ContaSite (vitrine pública do corretor).

Este módulo define o Enum StatusConta que é a FONTE ÚNICA DA VERDADE
para o status de contas de vitrine no sistema. SEMPRE use este Enum ao
referenciar status de conta, NUNCA strings literais.
"""

from util.enum_base import EnumEntidade


class StatusConta(EnumEntidade):
    """
    Enum para o status de uma ContaSite.

    - ATIVO: a vitrine aparece publicamente em /v/{slug} e na home.
    - INATIVO: a vitrine fica oculta ao público (ação administrativa).

    Herda de EnumEntidade que fornece métodos úteis:
        - valores(): Lista todos os valores
        - existe(valor): Verifica se valor existe
        - from_valor(valor): Converte string para enum
        - validar(valor): Valida e retorna ou levanta ValueError
    """

    ATIVO = "Ativo"
    INATIVO = "Inativo"
