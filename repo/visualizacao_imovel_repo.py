"""
Repositório de Visualização de Imóvel (tabela ``visualizacao_imovel``).
Camada Repos da arquitetura Routes -> DTOs -> Repos -> SQL -> DB. 
SQL puro com prepared statements, sem ORM. Datas de gravação usam ``agora()`` (NUNCA ``strftime``).
"""
from sql.visualizacao_imovel_sql import (
    CRIAR_TABELA,
    REGISTRAR,
    CONTAR_POR_CONTA,
    TOP_MAIS_VISTOS,
)
from util.db_util import obter_conexao
from util.datetime_util import agora

# ===================== TABELA =====================
def criar_tabela() -> bool:
    """Cria a tabela de visualizações (chamada no startup pelo main.py)."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA)
        return True

# ===================== REGISTRO =====================
def registrar(imovel_id: int) -> bool:
    """Registra uma visualização (um acesso) do imóvel informado."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(REGISTRAR, (imovel_id, agora()))
        return cursor.lastrowid is not None

# ===================== CONTADORES (DASHBOARD) =====================
def contar_por_conta(conta_site_id: int) -> int:
    """Total de acessos a todos os imóveis de uma conta-site."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CONTAR_POR_CONTA, (conta_site_id,))
        row = cursor.fetchone()
        return row["total"] if row else 0

def top_mais_vistos(conta_site_id: int) -> list[dict]:
    """Top 5 imóveis mais vistos de uma conta-site.
    Retorna uma lista de dicts ``{imovel_id, titulo, total}`` já ordenada do
    mais visto para o menos visto.
    """
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(TOP_MAIS_VISTOS, (conta_site_id,))
        return [
            {
                "imovel_id": row["imovel_id"],
                "titulo": row["titulo"],
                "total": row["total"],
            }
            for row in cursor.fetchall()
        ]