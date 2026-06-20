"""
Repositório das fotos de imóvel (tabela ``foto_imovel``, relação 1:N).

A criação da tabela é feita por ``repo.imovel_repo.criar_tabela`` (que cria as
três tabelas do módulo na ordem correta de dependência). Este módulo concentra
apenas o CRUD e as regras de foto principal.
"""
import sqlite3
from typing import Optional

from model.foto_imovel_model import FotoImovel
from sql.imovel_sql import (
    INSERIR_FOTO,
    ATUALIZAR_FOTO,
    OBTER_FOTO_POR_ID,
    OBTER_FOTOS_POR_IMOVEL,
    EXCLUIR_FOTO,
    EXCLUIR_FOTOS_POR_IMOVEL,
    DESMARCAR_PRINCIPAL,
    DEFINIR_FOTO_PRINCIPAL,
)
from util.db_util import obter_conexao


def _row_to_foto(row: sqlite3.Row) -> FotoImovel:
    return FotoImovel(
        id=row["id"],
        imovel_id=row["imovel_id"],
        url_arquivo=row["url_arquivo"],
        ordem=row["ordem"],
        foto_principal=bool(row["foto_principal"]),
        legenda=row["legenda"],
    )


def inserir(foto: FotoImovel) -> Optional[int]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(
            INSERIR_FOTO,
            (
                foto.imovel_id,
                foto.url_arquivo,
                foto.ordem,
                1 if foto.foto_principal else 0,
                foto.legenda,
            ),
        )
        return cursor.lastrowid


def atualizar(foto: FotoImovel) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(
            ATUALIZAR_FOTO,
            (
                foto.url_arquivo,
                foto.ordem,
                1 if foto.foto_principal else 0,
                foto.legenda,
                foto.id,
            ),
        )
        return cursor.rowcount > 0


def obter_por_id(id: int) -> Optional[FotoImovel]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_FOTO_POR_ID, (id,))
        row = cursor.fetchone()
        return _row_to_foto(row) if row else None


def obter_por_imovel(imovel_id: int) -> list[FotoImovel]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_FOTOS_POR_IMOVEL, (imovel_id,))
        return [_row_to_foto(row) for row in cursor.fetchall()]


def excluir(id: int) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(EXCLUIR_FOTO, (id,))
        return cursor.rowcount > 0


def excluir_por_imovel(imovel_id: int) -> int:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(EXCLUIR_FOTOS_POR_IMOVEL, (imovel_id,))
        return cursor.rowcount


def definir_principal(imovel_id: int, foto_id: int) -> bool:
    """Marca ``foto_id`` como principal e zera o flag das demais do imóvel."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(DESMARCAR_PRINCIPAL, (imovel_id, foto_id))
        cursor.execute(DEFINIR_FOTO_PRINCIPAL, (foto_id,))
        return cursor.rowcount > 0
