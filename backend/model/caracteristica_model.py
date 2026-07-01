"""Modelo de domínio da Característica/Comodidade do imóvel."""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Caracteristica:
    """Comodidade que pode ser vinculada a vários imóveis (relação N:N)."""

    id: int
    nome: str
    icone: Optional[str] = None
    data_cadastro: Optional[datetime] = None
    data_atualizacao: Optional[datetime] = None