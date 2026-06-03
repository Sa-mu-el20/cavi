CRIAR_TABELA = """
CREATE TABLE IF NOT EXISTS cidade (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    uf TEXT NOT NULL
)
"""

INSERIR = """
INSERT INTO cidade (nome, uf)
VALUES (?, ?)
"""

OBTER_TODOS = """
SELECT * FROM cidade
ORDER BY uf ASC, nome ASC
"""

OBTER_POR_ID = """
SELECT * FROM cidade
WHERE id = ?
"""

ATUALIZAR = """
UPDATE cidade
SET nome = ?, uf = ?
WHERE id = ?
"""

EXCLUIR = "DELETE FROM cidade WHERE id = ?"
