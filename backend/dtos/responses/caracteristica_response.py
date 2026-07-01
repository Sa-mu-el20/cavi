"""
Schema de resposta do módulo Característica/Comodidade.

Tipo espelhado em ``frontend/src/lib/types.ts`` (interface Caracteristica).
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from model.caracteristica_model import Caracteristica


class CaracteristicaResponse(BaseModel):
    """Comodidade do catálogo."""

    id: int
    nome: str
    icone: Optional[str] = None
    data_cadastro: Optional[datetime] = None
    data_atualizacao: Optional[datetime] = None

    @classmethod
    def de_caracteristica(cls, c: Caracteristica) -> "CaracteristicaResponse":
        return cls(
            id=c.id,
            nome=c.nome,
            icone=c.icone,
            data_cadastro=c.data_cadastro,
            data_atualizacao=c.data_atualizacao,
        )