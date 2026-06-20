"""
Modelo de domínio do Imóvel e seus enums.

Os enums herdam de ``EnumEntidade`` (fonte única da verdade para os valores
de domínio; NUNCA usar strings literais nas demais camadas).
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from util.enum_base import EnumEntidade
from model.endereco_imovel_model import EnderecoImovel
from model.foto_imovel_model import FotoImovel


class StatusImovel(EnumEntidade):
    """Status de publicação de um imóvel."""

    PUBLICADO = "Publicado"
    OCULTO = "Oculto"


class FinalidadeImovel(EnumEntidade):
    """Finalidade comercial do imóvel."""

    VENDA = "Venda"
    ALUGUEL = "Aluguel"


class TipoImovel(EnumEntidade):
    """Tipo construtivo do imóvel."""

    APARTAMENTO = "Apartamento"
    CASA = "Casa"
    STUDIO = "Studio"
    COBERTURA = "Cobertura"
    LOFT = "Loft"
    SALA_COMERCIAL = "Sala comercial"
    TERRENO = "Terreno"


class StatusConta(EnumEntidade):
    """Status da conta-site dona do imóvel."""

    ATIVO = "Ativo"
    INATIVO = "Inativo"


@dataclass
class Imovel:
    """
    Entidade Imóvel.

    Agrega (1:1) o ``endereco`` e (1:N) as ``fotos`` quando carregada via
    ``obter_detalhe``. Em listagens esses agregados podem vir ``None``/vazios.
    """

    id: int
    conta_site_id: int
    titulo: str
    tipo: TipoImovel
    finalidade: FinalidadeImovel
    preco: float
    codigo: Optional[str] = None
    slug: Optional[str] = None
    descricao: Optional[str] = None
    area: Optional[float] = None
    quartos: Optional[int] = None
    banheiros: Optional[int] = None
    vagas: Optional[int] = None
    destaque: bool = False
    status_publicacao: StatusImovel = StatusImovel.OCULTO
    data_cadastro: Optional[datetime] = None
    data_atualizacao: Optional[datetime] = None
    # Agregados (carregados sob demanda)
    endereco: Optional[EnderecoImovel] = None
    fotos: list[FotoImovel] = field(default_factory=list)
