"""
SQL puro (prepared statements) do módulo Imóvel.

Cobre as três tabelas — ``imovel``, ``endereco_imovel`` (1:1) e
``foto_imovel`` (1:N) — e as queries de CRUD, upsert de endereço, CRUD de
fotos, listagem por conta, filtros públicos e contadores de dashboard.

Os filtros dinâmicos (finalidade/tipo/bairro/preço/somente_publicados) são
montados em ``repo.imovel_repo`` concatenando cláusulas a ``LISTAR_BASE`` e
``LISTAR_COUNT_BASE``; as constantes aqui são apenas os esqueletos fixos.
"""

# ===================== TABELAS =====================

CRIAR_TABELA_IMOVEL = """
CREATE TABLE IF NOT EXISTS imovel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conta_site_id INTEGER NOT NULL,
    codigo TEXT,
    titulo TEXT NOT NULL,
    slug TEXT,
    descricao TEXT,
    tipo TEXT NOT NULL,
    finalidade TEXT NOT NULL,
    preco REAL NOT NULL,
    area REAL,
    quartos INTEGER,
    banheiros INTEGER,
    vagas INTEGER,
    destaque INTEGER NOT NULL DEFAULT 0,
    status_publicacao TEXT NOT NULL DEFAULT 'Oculto',
    data_cadastro TIMESTAMP,
    data_atualizacao TIMESTAMP,
    FOREIGN KEY (conta_site_id) REFERENCES conta_site(id) ON DELETE CASCADE
)
"""

CRIAR_TABELA_ENDERECO = """
CREATE TABLE IF NOT EXISTS endereco_imovel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    imovel_id INTEGER NOT NULL UNIQUE,
    cep TEXT,
    logradouro TEXT,
    numero TEXT,
    bairro TEXT,
    cidade TEXT,
    uf TEXT,
    complemento TEXT,
    FOREIGN KEY (imovel_id) REFERENCES imovel(id) ON DELETE CASCADE
)
"""

CRIAR_TABELA_FOTO = """
CREATE TABLE IF NOT EXISTS foto_imovel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    imovel_id INTEGER NOT NULL,
    url_arquivo TEXT NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 0,
    foto_principal INTEGER NOT NULL DEFAULT 0,
    legenda TEXT,
    FOREIGN KEY (imovel_id) REFERENCES imovel(id) ON DELETE CASCADE
)
"""

# ===================== CRUD IMÓVEL =====================

INSERIR_IMOVEL = """
INSERT INTO imovel (
    conta_site_id, codigo, titulo, slug, descricao, tipo, finalidade,
    preco, area, quartos, banheiros, vagas, destaque, status_publicacao,
    data_cadastro, data_atualizacao
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
"""

ATUALIZAR_IMOVEL = """
UPDATE imovel
SET codigo = ?,
    titulo = ?,
    slug = ?,
    descricao = ?,
    tipo = ?,
    finalidade = ?,
    preco = ?,
    area = ?,
    quartos = ?,
    banheiros = ?,
    vagas = ?,
    destaque = ?,
    status_publicacao = ?,
    data_atualizacao = ?
WHERE id = ?
"""

OBTER_IMOVEL_POR_ID = "SELECT * FROM imovel WHERE id = ?"

OBTER_IMOVEL_POR_SLUG = "SELECT * FROM imovel WHERE conta_site_id = ? AND slug = ?"

EXCLUIR_IMOVEL = "DELETE FROM imovel WHERE id = ?"

ALTERAR_STATUS_PUBLICACAO = """
UPDATE imovel
SET status_publicacao = ?, data_atualizacao = ?
WHERE id = ?
"""

# ===================== UPSERT ENDEREÇO (1:1) =====================

INSERIR_ENDERECO = """
INSERT INTO endereco_imovel (
    imovel_id, cep, logradouro, numero, bairro, cidade, uf, complemento
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
"""

# Upsert real: usa o índice UNIQUE em imovel_id para atualizar quando já existe.
UPSERT_ENDERECO = """
INSERT INTO endereco_imovel (
    imovel_id, cep, logradouro, numero, bairro, cidade, uf, complemento
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(imovel_id) DO UPDATE SET
    cep = excluded.cep,
    logradouro = excluded.logradouro,
    numero = excluded.numero,
    bairro = excluded.bairro,
    cidade = excluded.cidade,
    uf = excluded.uf,
    complemento = excluded.complemento
"""

OBTER_ENDERECO_POR_IMOVEL = "SELECT * FROM endereco_imovel WHERE imovel_id = ?"

EXCLUIR_ENDERECO = "DELETE FROM endereco_imovel WHERE imovel_id = ?"

# ===================== CRUD FOTOS (1:N) =====================

INSERIR_FOTO = """
INSERT INTO foto_imovel (imovel_id, url_arquivo, ordem, foto_principal, legenda)
VALUES (?, ?, ?, ?, ?)
"""

ATUALIZAR_FOTO = """
UPDATE foto_imovel
SET url_arquivo = ?, ordem = ?, foto_principal = ?, legenda = ?
WHERE id = ?
"""

OBTER_FOTO_POR_ID = "SELECT * FROM foto_imovel WHERE id = ?"

OBTER_FOTOS_POR_IMOVEL = """
SELECT * FROM foto_imovel
WHERE imovel_id = ?
ORDER BY foto_principal DESC, ordem ASC, id ASC
"""

EXCLUIR_FOTO = "DELETE FROM foto_imovel WHERE id = ?"

EXCLUIR_FOTOS_POR_IMOVEL = "DELETE FROM foto_imovel WHERE imovel_id = ?"

# Zera o flag de foto principal das demais fotos do imóvel (exceto a informada).
DESMARCAR_PRINCIPAL = """
UPDATE foto_imovel
SET foto_principal = 0
WHERE imovel_id = ? AND id != ?
"""

DEFINIR_FOTO_PRINCIPAL = """
UPDATE foto_imovel
SET foto_principal = 1
WHERE id = ?
"""

# ===================== LISTAGEM / FILTROS =====================

# Base de listagem reutilizada por "listar_por_conta" e pelos filtros públicos.
# O WHERE dinâmico é concatenado no repositório (cláusulas AND adicionais).
LISTAR_BASE = "SELECT * FROM imovel WHERE conta_site_id = ?"

LISTAR_COUNT_BASE = "SELECT COUNT(*) as total FROM imovel WHERE conta_site_id = ?"

# Cláusulas de filtro dinâmico (concatenadas conforme parâmetros presentes).
FILTRO_SOMENTE_PUBLICADOS = " AND status_publicacao = 'Publicado'"
FILTRO_FINALIDADE = " AND finalidade = ?"
FILTRO_TIPO = " AND tipo = ?"
FILTRO_BAIRRO = (
    " AND id IN (SELECT imovel_id FROM endereco_imovel "
    "WHERE bairro LIKE ?)"
)
FILTRO_PRECO_MIN = " AND preco >= ?"
FILTRO_PRECO_MAX = " AND preco <= ?"

# Ordenação fixa aplicada ao fim das listagens.
ORDENAR_LISTAGEM = " ORDER BY destaque DESC, data_cadastro DESC, id DESC"

# ===================== CONTADORES (DASHBOARD) =====================

CONTAR_POR_CONTA = "SELECT COUNT(*) as total FROM imovel WHERE conta_site_id = ?"

CONTAR_PUBLICADOS_POR_CONTA = """
SELECT COUNT(*) as total FROM imovel
WHERE conta_site_id = ? AND status_publicacao = 'Publicado'
"""

CONTAR_OCULTOS_POR_CONTA = """
SELECT COUNT(*) as total FROM imovel
WHERE conta_site_id = ? AND status_publicacao = 'Oculto'
"""

CONTAR_DESTAQUES_POR_CONTA = """
SELECT COUNT(*) as total FROM imovel
WHERE conta_site_id = ? AND destaque = 1
"""

# Contagem agrupada por finalidade (Venda/Aluguel) para o dashboard.
CONTAR_POR_FINALIDADE = """
SELECT finalidade, COUNT(*) as total
FROM imovel
WHERE conta_site_id = ?
GROUP BY finalidade
"""
