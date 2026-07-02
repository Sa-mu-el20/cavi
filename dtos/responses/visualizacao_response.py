"""
Schemas de resposta do dashboard de visualizações (módulo Visualização).

Expõem o total de acessos e o ranking dos imóveis mais vistos de uma conta-site
(catálogo do corretor). Tipos espelhados em ``frontend/src/lib/types.ts``.
"""

from pydantic import BaseModel, Field


class ImovelMaisVistoResponse(BaseModel):
    """Uma linha do ranking de imóveis mais vistos."""

    imovel_id: int
    titulo: str
    total: int = Field(..., description="Quantidade de visualizações do imóvel")

    @classmethod
    def de_dict(cls, dados: dict) -> "ImovelMaisVistoResponse":
        """Constrói a partir do dict retornado pelo repositório."""
        return cls(
            imovel_id=dados["imovel_id"],
            titulo=dados["titulo"],
            total=dados["total"],
        )


class VisualizacoesDashboardResponse(BaseModel):
    """Payload do bloco de visualizações no dashboard do corretor."""

    total_acessos: int = Field(
        ..., description="Total de acessos a todos os imóveis da conta"
    )
    mais_vistos: list[ImovelMaisVistoResponse] = Field(
        default_factory=list, description="Top 5 imóveis mais vistos"
    )