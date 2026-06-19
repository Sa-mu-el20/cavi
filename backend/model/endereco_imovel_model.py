"""Modelo de domínio do Endereço do Imóvel (relação 1:1 com Imovel)."""
from dataclasses import dataclass
from typing import Optional


@dataclass
class EnderecoImovel:
    """Endereço de um imóvel. Há no máximo um por imóvel (imovel_id UNIQUE)."""

    id: int
    imovel_id: int
    cep: Optional[str] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None
    complemento: Optional[str] = None
