"""
Repositório de Imóveis (tabela ``imovel`` + agregados ``endereco_imovel`` 1:1
e ``foto_imovel`` 1:N).

Camada Repos da arquitetura Routes -> DTOs -> Repos -> SQL -> DB. SQL puro com
prepared statements, sem ORM. Datas de gravação usam ``agora()`` (NUNCA
``strftime``).
"""
import sqlite3
from typing import Optional, TypeVar, Type
from enum import Enum

from model.imovel_model import (
    Imovel,
    StatusImovel,
    FinalidadeImovel,
    TipoImovel,
)
from model.endereco_imovel_model import EnderecoImovel
from sql.imovel_sql import (
    CRIAR_TABELA_IMOVEL,
    CRIAR_TABELA_ENDERECO,
    CRIAR_TABELA_FOTO,
    INSERIR_IMOVEL,
    ATUALIZAR_IMOVEL,
    OBTER_IMOVEL_POR_ID,
    OBTER_IMOVEL_POR_SLUG,
    EXCLUIR_IMOVEL,
    ALTERAR_STATUS_PUBLICACAO,
    UPSERT_ENDERECO,
    OBTER_ENDERECO_POR_IMOVEL,
    EXCLUIR_ENDERECO,
    LISTAR_BASE,
    LISTAR_COUNT_BASE,
    FILTRO_SOMENTE_PUBLICADOS,
    FILTRO_FINALIDADE,
    FILTRO_TIPO,
    FILTRO_BAIRRO,
    FILTRO_PRECO_MIN,
    FILTRO_PRECO_MAX,
    ORDENAR_LISTAGEM,
    CONTAR_POR_CONTA,
    CONTAR_PUBLICADOS_POR_CONTA,
    CONTAR_OCULTOS_POR_CONTA,
    CONTAR_DESTAQUES_POR_CONTA,
    CONTAR_POR_FINALIDADE,
)
from repo import foto_imovel_repo
from util.db_util import obter_conexao
from util.datetime_util import agora
from util.logger_config import logger
from util.paginacao_util import Paginacao, obter_paginado

T = TypeVar("T", bound=Enum)


# ===================== HELPERS =====================


def _converter_enum_seguro(valor: str, tipo_enum: Type[T], padrao: T) -> T:
    """Converte string para Enum de forma segura, com fallback logado."""
    try:
        return tipo_enum(valor)
    except ValueError:
        logger.error(
            f"Valor inválido para {tipo_enum.__name__}: '{valor}'. "
            f"Usando padrão: {padrao.value}"
        )
        return padrao


def _row_to_imovel(row: sqlite3.Row) -> Imovel:
    return Imovel(
        id=row["id"],
        conta_site_id=row["conta_site_id"],
        codigo=row["codigo"],
        titulo=row["titulo"],
        slug=row["slug"],
        descricao=row["descricao"],
        tipo=_converter_enum_seguro(row["tipo"], TipoImovel, TipoImovel.APARTAMENTO),
        finalidade=_converter_enum_seguro(
            row["finalidade"], FinalidadeImovel, FinalidadeImovel.VENDA
        ),
        preco=row["preco"],
        area=row["area"],
        quartos=row["quartos"],
        banheiros=row["banheiros"],
        vagas=row["vagas"],
        destaque=bool(row["destaque"]),
        status_publicacao=_converter_enum_seguro(
            row["status_publicacao"], StatusImovel, StatusImovel.OCULTO
        ),
        data_cadastro=row["data_cadastro"],
        data_atualizacao=row["data_atualizacao"],
    )


def _row_to_endereco(row: sqlite3.Row) -> EnderecoImovel:
    return EnderecoImovel(
        id=row["id"],
        imovel_id=row["imovel_id"],
        cep=row["cep"],
        logradouro=row["logradouro"],
        numero=row["numero"],
        bairro=row["bairro"],
        cidade=row["cidade"],
        uf=row["uf"],
        complemento=row["complemento"],
    )


# ===================== TABELAS =====================


def criar_tabela() -> bool:
    """Cria as três tabelas do módulo na ordem de dependência (imovel primeiro)."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA_IMOVEL)
        cursor.execute(CRIAR_TABELA_ENDERECO)
        cursor.execute(CRIAR_TABELA_FOTO)
        return True


# ===================== CRUD IMÓVEL =====================


def inserir(imovel: Imovel) -> Optional[int]:
    """Insere o imóvel e, se presente, faz o upsert do endereço aninhado."""
    momento = agora()
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(
            INSERIR_IMOVEL,
            (
                imovel.conta_site_id,
                imovel.codigo,
                imovel.titulo,
                imovel.slug,
                imovel.descricao,
                imovel.tipo.value,
                imovel.finalidade.value,
                imovel.preco,
                imovel.area,
                imovel.quartos,
                imovel.banheiros,
                imovel.vagas,
                1 if imovel.destaque else 0,
                imovel.status_publicacao.value,
                momento,
                momento,
            ),
        )
        novo_id = cursor.lastrowid

        if imovel.endereco is not None and novo_id:
            cursor.execute(
                UPSERT_ENDERECO,
                (
                    novo_id,
                    imovel.endereco.cep,
                    imovel.endereco.logradouro,
                    imovel.endereco.numero,
                    imovel.endereco.bairro,
                    imovel.endereco.cidade,
                    imovel.endereco.uf,
                    imovel.endereco.complemento,
                ),
            )

        return novo_id


def atualizar(imovel: Imovel) -> bool:
    """Atualiza o imóvel e, se presente, faz o upsert do endereço aninhado."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(
            ATUALIZAR_IMOVEL,
            (
                imovel.codigo,
                imovel.titulo,
                imovel.slug,
                imovel.descricao,
                imovel.tipo.value,
                imovel.finalidade.value,
                imovel.preco,
                imovel.area,
                imovel.quartos,
                imovel.banheiros,
                imovel.vagas,
                1 if imovel.destaque else 0,
                imovel.status_publicacao.value,
                agora(),
                imovel.id,
            ),
        )
        atualizou = cursor.rowcount > 0

        if imovel.endereco is not None:
            cursor.execute(
                UPSERT_ENDERECO,
                (
                    imovel.id,
                    imovel.endereco.cep,
                    imovel.endereco.logradouro,
                    imovel.endereco.numero,
                    imovel.endereco.bairro,
                    imovel.endereco.cidade,
                    imovel.endereco.uf,
                    imovel.endereco.complemento,
                ),
            )

        return atualizou


def obter_por_id(id: int) -> Optional[Imovel]:
    """Retorna o imóvel sem agregados (endereço/fotos vêm em ``obter_detalhe``)."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_IMOVEL_POR_ID, (id,))
        row = cursor.fetchone()
        return _row_to_imovel(row) if row else None


def obter_por_slug(conta_site_id: int, slug: str) -> Optional[Imovel]:
    """Resolve um imóvel por slug dentro do escopo de uma conta-site."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_IMOVEL_POR_SLUG, (conta_site_id, slug))
        row = cursor.fetchone()
        return _row_to_imovel(row) if row else None


def obter_detalhe(id: int) -> Optional[Imovel]:
    """Retorna o imóvel com ``endereco`` (1:1) e ``fotos`` (1:N) carregados."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_IMOVEL_POR_ID, (id,))
        row = cursor.fetchone()
        if not row:
            return None
        imovel = _row_to_imovel(row)

        cursor.execute(OBTER_ENDERECO_POR_IMOVEL, (id,))
        row_end = cursor.fetchone()
        if row_end:
            imovel.endereco = _row_to_endereco(row_end)

    imovel.fotos = foto_imovel_repo.obter_por_imovel(id)
    return imovel


def excluir(id: int) -> bool:
    """Exclui o imóvel; endereço e fotos caem por ON DELETE CASCADE."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(EXCLUIR_IMOVEL, (id,))
        return cursor.rowcount > 0


def alterar_status_publicacao(id: int, status: StatusImovel) -> bool:
    """Alterna entre Publicado/Oculto, atualizando ``data_atualizacao``."""
    valor = status.value if isinstance(status, StatusImovel) else status
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ALTERAR_STATUS_PUBLICACAO, (valor, agora(), id))
        return cursor.rowcount > 0


# ===================== ENDEREÇO (1:1) =====================


def upsert_endereco(endereco: EnderecoImovel) -> bool:
    """Insere ou atualiza o endereço único do imóvel (chave: imovel_id)."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(
            UPSERT_ENDERECO,
            (
                endereco.imovel_id,
                endereco.cep,
                endereco.logradouro,
                endereco.numero,
                endereco.bairro,
                endereco.cidade,
                endereco.uf,
                endereco.complemento,
            ),
        )
        return cursor.rowcount > 0


def obter_endereco(imovel_id: int) -> Optional[EnderecoImovel]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_ENDERECO_POR_IMOVEL, (imovel_id,))
        row = cursor.fetchone()
        return _row_to_endereco(row) if row else None


def excluir_endereco(imovel_id: int) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(EXCLUIR_ENDERECO, (imovel_id,))
        return cursor.rowcount > 0


# ===================== LISTAGEM / FILTROS =====================


def _montar_filtros(
    finalidade: Optional[str],
    tipo: Optional[str],
    bairro: Optional[str],
    preco_min: Optional[float],
    preco_max: Optional[float],
    somente_publicados: bool,
) -> tuple[str, list]:
    """Monta o trecho WHERE dinâmico e os parâmetros correspondentes.

    Retorna ``(sql_extra, params_extra)`` para concatenar a ``LISTAR_BASE`` /
    ``LISTAR_COUNT_BASE``. Não inclui o ``conta_site_id`` (já fixo na base).
    """
    sql = ""
    params: list = []

    if somente_publicados:
        sql += FILTRO_SOMENTE_PUBLICADOS
    if finalidade:
        sql += FILTRO_FINALIDADE
        params.append(finalidade)
    if tipo:
        sql += FILTRO_TIPO
        params.append(tipo)
    if bairro:
        sql += FILTRO_BAIRRO
        params.append(f"%{bairro}%")
    if preco_min is not None:
        sql += FILTRO_PRECO_MIN
        params.append(preco_min)
    if preco_max is not None:
        sql += FILTRO_PRECO_MAX
        params.append(preco_max)

    return sql, params


def listar_por_conta(
    conta_site_id: int,
    pagina: int = 1,
    por_pagina: int = 10,
    finalidade: Optional[str] = None,
    tipo: Optional[str] = None,
    bairro: Optional[str] = None,
    preco_min: Optional[float] = None,
    preco_max: Optional[float] = None,
    somente_publicados: bool = False,
) -> Paginacao:
    """
    Lista imóveis de uma conta-site, paginado, com filtros opcionais.

    Serve tanto a administração (``somente_publicados=False`` traz Publicado e
    Oculto) quanto a vitrine pública (``somente_publicados=True``). Os ``items``
    da ``Paginacao`` são entidades ``Imovel`` SEM agregados (use ``obter_detalhe``
    para carregar endereço/fotos de um item específico).
    """
    sql_extra, params_extra = _montar_filtros(
        finalidade, tipo, bairro, preco_min, preco_max, somente_publicados
    )

    sql_count = LISTAR_COUNT_BASE + sql_extra
    sql_dados = LISTAR_BASE + sql_extra + ORDENAR_LISTAGEM
    params = tuple([conta_site_id] + params_extra)

    return obter_paginado(
        sql_count=sql_count,
        sql_dados=sql_dados,
        params=params,
        pagina=pagina,
        por_pagina=por_pagina,
        row_converter=_row_to_imovel,
    )


# ===================== CONTADORES (DASHBOARD) =====================


def _contar(sql: str, conta_site_id: int) -> int:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(sql, (conta_site_id,))
        row = cursor.fetchone()
        return row["total"] if row else 0


def contar_por_conta(conta_site_id: int) -> int:
    return _contar(CONTAR_POR_CONTA, conta_site_id)


def contar_publicados(conta_site_id: int) -> int:
    return _contar(CONTAR_PUBLICADOS_POR_CONTA, conta_site_id)


def contar_ocultos(conta_site_id: int) -> int:
    return _contar(CONTAR_OCULTOS_POR_CONTA, conta_site_id)


def contar_destaques(conta_site_id: int) -> int:
    return _contar(CONTAR_DESTAQUES_POR_CONTA, conta_site_id)


def contar_por_finalidade(conta_site_id: int) -> dict[str, int]:
    """Retorna {finalidade: total} para o dashboard (ex.: {'Venda': 3, 'Aluguel': 5})."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CONTAR_POR_FINALIDADE, (conta_site_id,))
        return {row["finalidade"]: row["total"] for row in cursor.fetchall()}
