"""Repositório de Cidade."""

import sqlite3
from typing import Optional

from model.cidade_model import Cidade
from sql.cidade_sql import (
    CRIAR_TABELA,
    INSERIR,
    OBTER_TODOS,
    OBTER_POR_ID,
    ATUALIZAR,
    EXCLUIR,
)
from util.db_util import obter_conexao
from util.logger_config import logger


def _row_to_cidade(row: sqlite3.Row) -> Cidade:
    """Converte sqlite3.Row em dataclass Cidade."""
    return Cidade(
        id=row["id"],
        nome=row["nome"],
        uf=row["uf"],
    )


def criar_tabela() -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA)
        return True


def inserir(cidade: Cidade) -> Optional[int]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(INSERIR, (
            cidade.nome,
            cidade.uf,
        ))
        return cursor.lastrowid


def obter_todos() -> list[Cidade]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_TODOS)
        return [_row_to_cidade(row) for row in cursor.fetchall()]


def obter_por_id(id: int) -> Optional[Cidade]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_ID, (id,))
        row = cursor.fetchone()
        return _row_to_cidade(row) if row else None


def atualizar(cidade: Cidade) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ATUALIZAR, (
            cidade.nome,
            cidade.uf,
            cidade.id,
        ))
        return cursor.rowcount > 0


def excluir(id: int) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(EXCLUIR, (id,))
        return cursor.rowcount > 0
