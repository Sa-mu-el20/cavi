"""Modelo de domínio da Foto do Imóvel (relação 1:N com Imovel)."""
from dataclasses import dataclass
from typing import Optional


@dataclass
class FotoImovel:
    """Foto vinculada a um imóvel."""

    id: int
    imovel_id: int
    url_arquivo: str
    ordem: int = 0
    foto_principal: bool = False
    legenda: Optional[str] = None
