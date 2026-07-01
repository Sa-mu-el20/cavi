"""
SQL puro (prepared statements) do módulo Característica/Comodidade.

Cobre a tabela ``caracteristica`` (catálogo de comodidades) e a tabela de
junção ``imovel_caracteristica`` (relação N:N com ``imovel``). Segue o mesmo
estilo de ``sql/imovel_sql.py``: constantes string, ``IF NOT EXISTS`` e FKs
com ``ON DELETE CASCADE``.
"""

# ===================== TABELAS =====================

CRIAR_TABELA_CARACTERISTICA = """
CREATE TABLE IF NOT EXISTS caracteristica (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    icone TEXT,
    data_cadastro TIMESTAMP,
    data_atualizacao TIMESTAMP
)
"""

# Junção N:N entre imovel e caracteristica. Chave primária composta evita
# vínculo duplicado; as duas FKs caem por ON DELETE CASCADE.
CRIAR_TABELA_IMOVEL_CARACTERISTICA = """
CREATE TABLE IF NOT EXISTS imovel_caracteristica (
    imovel_id INTEGER NOT NULL,
    caracteristica_id INTEGER NOT NULL,
    PRIMARY KEY (imovel_id, caracteristica_id),
    FOREIGN KEY (imovel_id) REFERENCES imovel(id) ON DELETE CASCADE,
    FOREIGN KEY (caracteristica_id) REFERENCES caracteristica(id) ON DELETE CASCADE
)
"""

# ===================== CRUD CARACTERÍSTICA =====================

INSERIR = """
INSERT INTO caracteristica (nome, icone, data_cadastro, data_atualizacao)
VALUES (?, ?, ?, ?)
"""

ATUALIZAR = """
UPDATE caracteristica
SET nome = ?, icone = ?, data_atualizacao = ?
WHERE id = ?
"""

OBTER_POR_ID = "SELECT * FROM caracteristica WHERE id = ?"

OBTER_POR_NOME = "SELECT * FROM caracteristica WHERE nome = ?"

OBTER_TODOS = "SELECT * FROM caracteristica ORDER BY nome ASC"

EXCLUIR = "DELETE FROM caracteristica WHERE id = ?"

# ===================== JUNÇÃO N:N =====================

# Insere o vínculo; OR IGNORE evita erro se o par já existir.
VINCULAR = """
INSERT OR IGNORE INTO imovel_caracteristica (imovel_id, caracteristica_id)
VALUES (?, ?)
"""

DESVINCULAR = """
DELETE FROM imovel_caracteristica
WHERE imovel_id = ? AND caracteristica_id = ?
"""

# Remove todos os vínculos de um imóvel (usado antes de regravar).
DESVINCULAR_TODAS_DO_IMOVEL = """
DELETE FROM imovel_caracteristica WHERE imovel_id = ?
"""

# Lista as características de um imóvel (faz JOIN para trazer nome/ícone).
LISTAR_POR_IMOVEL = """
SELECT c.*
FROM caracteristica c
INNER JOIN imovel_caracteristica ic ON ic.caracteristica_id = c.id
WHERE ic.imovel_id = ?
ORDER BY c.nome ASC
"""