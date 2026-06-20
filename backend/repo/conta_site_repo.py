"""
Repositório de ContaSite (catálogo público do corretor).

Camada de acesso a dados (SQL puro com prepared statements, sem ORM) para a
entidade ``ContaSite``. Há no máximo uma conta por usuário corretor
(restrição UNIQUE em ``usuario_id``), e o ``slug`` é único globalmente
(usado na rota pública ``/v/{slug}``).
"""

import sqlite3
from typing import Optional

from model.conta_site_model import ContaSite
from sql.conta_site_sql import (
    CRIAR_TABELA,
    INSERIR,
    ATUALIZAR,
    ATUALIZAR_STATUS,
    OBTER_TODOS,
    OBTER_POR_ID,
    OBTER_POR_SLUG,
    OBTER_POR_USUARIO,
    LISTAR_ATIVAS,
    EXCLUIR,
)
from util.db_util import obter_conexao
from util.datetime_util import agora
from util.status_conta import StatusConta
from util.logger_config import logger


def _converter_status_seguro(valor: str) -> StatusConta:
    """Converte string para StatusConta, com fallback seguro para Ativo."""
    try:
        return StatusConta(valor)
    except ValueError:
        logger.error(
            f"Status de conta inválido: '{valor}'. Usando padrão: {StatusConta.ATIVO.value}"
        )
        return StatusConta.ATIVO


def _row_to_conta_site(row: sqlite3.Row) -> ContaSite:
    """Converte uma linha do banco em objeto ContaSite."""
    keys = row.keys()
    usuario_nome = row["usuario_nome"] if "usuario_nome" in keys else None
    usuario_email = row["usuario_email"] if "usuario_email" in keys else None

    return ContaSite(
        id=row["id"],
        usuario_id=row["usuario_id"],
        nome_publico=row["nome_publico"],
        slug=row["slug"],
        status=_converter_status_seguro(row["status"]),
        descricao=row["descricao"],
        whatsapp=row["whatsapp"],
        creci=row["creci"],
        cidade=row["cidade"],
        uf=row["uf"],
        bairro=row["bairro"],
        cor=row["cor"],
        logo=row["logo"],
        data_cadastro=row["data_cadastro"],
        data_atualizacao=row["data_atualizacao"],
        usuario_nome=usuario_nome,
        usuario_email=usuario_email,
    )


def criar_tabela() -> bool:
    """Cria a tabela conta_site se não existir."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA)
        return True


def inserir(conta: ContaSite) -> Optional[int]:
    """
    Insere uma nova conta de catálogo.

    Args:
        conta: Objeto ContaSite a ser inserido.

    Returns:
        ID da conta inserida ou None em caso de erro.
    """
    with obter_conexao() as conn:
        cursor = conn.cursor()
        agora_dt = agora()
        cursor.execute(INSERIR, (
            conta.usuario_id,
            conta.nome_publico,
            conta.slug,
            conta.descricao,
            conta.whatsapp,
            conta.creci,
            conta.cidade,
            conta.uf,
            conta.bairro,
            conta.cor,
            conta.logo,
            conta.status.value,
            agora_dt,
            agora_dt,
        ))
        return cursor.lastrowid


def atualizar(conta: ContaSite) -> bool:
    """
    Atualiza os dados editáveis de uma conta de catálogo.

    O ``status`` não é alterado por aqui (use ``alterar_status``), e
    ``usuario_id`` é imutável.

    Args:
        conta: Objeto ContaSite com ``id`` preenchido e novos valores.

    Returns:
        True se atualizado com sucesso, False caso contrário.
    """
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ATUALIZAR, (
            conta.nome_publico,
            conta.slug,
            conta.descricao,
            conta.whatsapp,
            conta.creci,
            conta.cidade,
            conta.uf,
            conta.bairro,
            conta.cor,
            conta.logo,
            agora(),
            conta.id,
        ))
        return cursor.rowcount > 0


def alterar_status(id: int, status: StatusConta) -> bool:
    """
    Altera o status (Ativo/Inativo) de uma conta de catálogo.

    Args:
        id: ID da conta.
        status: Novo status (StatusConta).

    Returns:
        True se atualizado com sucesso, False caso contrário.
    """
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ATUALIZAR_STATUS, (
            status.value,
            agora(),
            id,
        ))
        return cursor.rowcount > 0


def obter_todos() -> list[ContaSite]:
    """Retorna todas as contas de catálogo (para admin), com dados do usuário."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_TODOS)
        rows = cursor.fetchall()
        return [_row_to_conta_site(row) for row in rows]


def obter_por_id(id: int) -> Optional[ContaSite]:
    """Retorna uma conta de catálogo pelo seu ID, ou None se não encontrada."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_ID, (id,))
        row = cursor.fetchone()
        return _row_to_conta_site(row) if row else None


def obter_por_slug(slug: str) -> Optional[ContaSite]:
    """
    Retorna a conta de catálogo pelo slug (rota pública /v/{slug}).

    Args:
        slug: Slug único do catálogo.

    Returns:
        Objeto ContaSite ou None se não encontrada.
    """
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_SLUG, (slug,))
        row = cursor.fetchone()
        return _row_to_conta_site(row) if row else None


def obter_por_usuario(usuario_id: int) -> Optional[ContaSite]:
    """
    Retorna a conta de catálogo de um usuário (relação 1-para-1), ou None.

    Args:
        usuario_id: ID do usuário corretor.

    Returns:
        Objeto ContaSite ou None se o usuário não tiver catálogo.
    """
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_USUARIO, (usuario_id,))
        row = cursor.fetchone()
        return _row_to_conta_site(row) if row else None


def listar_ativas() -> list[ContaSite]:
    """Retorna apenas as contas com status Ativo (catálogo público/home)."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(LISTAR_ATIVAS)
        rows = cursor.fetchall()
        return [_row_to_conta_site(row) for row in rows]


def excluir(id: int) -> bool:
    """Exclui uma conta de catálogo pelo ID."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(EXCLUIR, (id,))
        return cursor.rowcount > 0
