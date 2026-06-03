from dataclasses import dataclass
from typing import Optional


@dataclass
class Cidade:
    """Entidade Cidade."""
    id: int
    nome: str
    uf: str
