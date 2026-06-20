from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from util.status_conta import StatusConta


@dataclass
class ContaSite:
    """
    Vitrine pública do corretor (1 por usuário com perfil corretor/vendedor).

    Mapeia a tabela ``conta_site``. O ``slug`` é único e usado na rota
    pública ``/v/{slug}``. ``status`` controla a aparição pública e a ação
    administrativa de ativar/inativar a vitrine.
    """

    id: int
    usuario_id: int
    nome_publico: str
    slug: str
    status: StatusConta = StatusConta.ATIVO
    descricao: Optional[str] = None
    whatsapp: Optional[str] = None
    creci: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None
    bairro: Optional[str] = None
    cor: str = "#d97a2b"
    logo: Optional[str] = None
    data_cadastro: Optional[datetime] = None
    data_atualizacao: Optional[datetime] = None
    # Campos do JOIN (para exibição), preenchidos somente em consultas com usuário
    usuario_nome: Optional[str] = None
    usuario_email: Optional[str] = None
