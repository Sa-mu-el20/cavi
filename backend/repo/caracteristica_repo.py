"""
Repositório de Características/Comodidades (tabela ``caracteristica`` + junção
N:N ``imovel_caracteristica`` com ``imovel``).

Camada Repos da arquitetura Routes -> DTOs -> Repos -> SQL -> DB. SQL puro com
prepared statements, sem ORM. Datas de gravação usam ``agora()``.
"""
import sqlite3
from typing import Optional

from model.caracteristica_model import Caracteristica
from sql.caracteristica_sql import (
    CRIAR_TABELA_CARACTERISTICA,
    CRIAR_TABELA_IMOVEL_CARACTERISTICA,
    INSERIR,
    ATUALIZAR,
    OBTER_POR_ID,
    OBTER_POR_NOME,
    OBTER_TODOS,
    EXCLUIR,
    VINCULAR,
    DESVINCULAR,
    DESVINCULAR_TODAS_DO_IMOVEL,
    LISTAR_POR_IMOVEL,
)
from util.db_util import obter_conexao
from util.datetime_util import agora


# ===================== HELPERS =====================


def _row_to_caracteristica(row: sqlite3.Row) -> Caracteristica:
    return Caracteristica(
        id=row["id"],
        nome=row["nome"],
        icone=row["icone"],
        data_cadastro=row["data_cadastro"],
        data_atualizacao=row["data_atualizacao"],
    )


# ===================== TABELAS =====================


def criar_tabela() -> bool:
    """Cria a tabela do catálogo e a tabela de junção (nessa ordem)."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA_CARACTERISTICA)
        cursor.execute(CRIAR_TABELA_IMOVEL_CARACTERISTICA)
        return True


# ===================== CRUD CARACTERÍSTICA =====================


def inserir(caracteristica: Caracteristica) -> Optional[int]:
    momento = agora()
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(
            INSERIR,
            (
                caracteristica.nome,
                caracteristica.icone,
                momento,
                momento,
            ),
        )
        return cursor.lastrowid


def atualizar(caracteristica: Caracteristica) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(
            ATUALIZAR,
            (
                caracteristica.nome,
                caracteristica.icone,
                agora(),
                caracteristica.id,
            ),
        )
        return cursor.rowcount > 0


def obter_por_id(id: int) -> Optional[Caracteristica]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_ID, (id,))
        row = cursor.fetchone()
        return _row_to_caracteristica(row) if row else None


def obter_por_nome(nome: str) -> Optional[Caracteristica]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_NOME, (nome,))
        row = cursor.fetchone()
        return _row_to_caracteristica(row) if row else None


def obter_todos() -> list[Caracteristica]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_TODOS)
        return [_row_to_caracteristica(row) for row in cursor.fetchall()]


def excluir(id: int) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(EXCLUIR, (id,))
        return cursor.rowcount > 0


# ===================== JUNÇÃO N:N =====================


def vincular(imovel_id: int, caracteristica_id: int) -> bool:
    """Cria o vínculo imóvel <-> característica (ignora se já existir)."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(VINCULAR, (imovel_id, caracteristica_id))
        return cursor.rowcount > 0


def desvincular(imovel_id: int, caracteristica_id: int) -> bool:
    """Remove um vínculo específico imóvel <-> característica."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(DESVINCULAR, (imovel_id, caracteristica_id))
        return cursor.rowcount > 0


def definir_do_imovel(imovel_id: int, ids_caracteristicas: list[int]) -> None:
    """Regrava o conjunto de características de um imóvel.

    Apaga todos os vínculos atuais e recria os informados. Usado pela rota de
    salvar imóvel (a UI manda a lista completa de marcados).
    """
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(DESVINCULAR_TODAS_DO_IMOVEL, (imovel_id,))
        for cid in ids_caracteristicas:
            cursor.execute(VINCULAR, (imovel_id, cid))


def listar_por_imovel(imovel_id: int) -> list[Caracteristica]:
    """Lista as características vinculadas a um imóvel (via JOIN)."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(LISTAR_POR_IMOVEL, (imovel_id,))
        return [_row_to_caracteristica(row) for row in cursor.fetchall()]