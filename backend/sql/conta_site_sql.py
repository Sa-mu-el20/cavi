CRIAR_TABELA = """
CREATE TABLE IF NOT EXISTS conta_site (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL UNIQUE,
    nome_publico TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    descricao TEXT,
    whatsapp TEXT,
    creci TEXT,
    cidade TEXT,
    uf TEXT,
    bairro TEXT,
    cor TEXT NOT NULL DEFAULT '#d97a2b',
    logo TEXT,
    status TEXT NOT NULL DEFAULT 'Ativo',
    data_cadastro TIMESTAMP,
    data_atualizacao TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
)
"""

INSERIR = """
INSERT INTO conta_site (
    usuario_id, nome_publico, slug, descricao, whatsapp, creci,
    cidade, uf, bairro, cor, logo, status, data_cadastro, data_atualizacao
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
"""

ATUALIZAR = """
UPDATE conta_site
SET nome_publico = ?,
    slug = ?,
    descricao = ?,
    whatsapp = ?,
    creci = ?,
    cidade = ?,
    uf = ?,
    bairro = ?,
    cor = ?,
    logo = ?,
    data_atualizacao = ?
WHERE id = ?
"""

ATUALIZAR_STATUS = """
UPDATE conta_site
SET status = ?, data_atualizacao = ?
WHERE id = ?
"""

OBTER_TODOS = """
SELECT cs.*,
       u.nome as usuario_nome,
       u.email as usuario_email
FROM conta_site cs
INNER JOIN usuario u ON cs.usuario_id = u.id
ORDER BY cs.nome_publico COLLATE NOCASE
"""

OBTER_POR_ID = """
SELECT cs.*,
       u.nome as usuario_nome,
       u.email as usuario_email
FROM conta_site cs
INNER JOIN usuario u ON cs.usuario_id = u.id
WHERE cs.id = ?
"""

OBTER_POR_SLUG = """
SELECT cs.*,
       u.nome as usuario_nome,
       u.email as usuario_email
FROM conta_site cs
INNER JOIN usuario u ON cs.usuario_id = u.id
WHERE cs.slug = ?
"""

OBTER_POR_USUARIO = """
SELECT cs.*,
       u.nome as usuario_nome,
       u.email as usuario_email
FROM conta_site cs
INNER JOIN usuario u ON cs.usuario_id = u.id
WHERE cs.usuario_id = ?
"""

LISTAR_ATIVAS = """
SELECT cs.*,
       u.nome as usuario_nome,
       u.email as usuario_email
FROM conta_site cs
INNER JOIN usuario u ON cs.usuario_id = u.id
WHERE cs.status = 'Ativo'
ORDER BY cs.nome_publico COLLATE NOCASE
"""

EXCLUIR = "DELETE FROM conta_site WHERE id = ?"
