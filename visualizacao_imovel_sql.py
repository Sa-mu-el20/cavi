"""
SQL puro (prepared statements) do módulo Visualização de Imóvel.

Cada linha de ``visualizacao_imovel`` representa um acesso ao detalhe público
de um imóvel. Serve aos contadores do dashboard do corretor (total de acessos
e ranking de imóveis mais vistos).
"""

# ===================== TABELA =====================
CRIAR_TABELA = """
CREATE TABLE IF NOT EXISTS visualizacao_imovel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    imovel_id INTEGER NOT NULL,
    data_visualizacao TIMESTAMP,
    FOREIGN KEY (imovel_id) REFERENCES imovel(id) ON DELETE CASCADE
)
"""

# ===================== REGISTRO =====================
REGISTRAR = """
INSERT INTO visualizacao_imovel (imovel_id, data_visualizacao)
VALUES (?, ?)
"""

# ===================== CONTADORES (DASHBOARD) =====================
# Total de acessos a TODOS os imóveis de uma conta-site (JOIN com imovel para
# escopar pela conta do corretor).
CONTAR_POR_CONTA = """
SELECT COUNT(*) AS total
FROM visualizacao_imovel v
INNER JOIN imovel i ON v.imovel_id = i.id
WHERE i.conta_site_id = ?
"""

# Top 5 imóveis mais vistos de uma conta-site, com o título e a contagem.
TOP_MAIS_VISTOS = """
SELECT i.id AS imovel_id, i.titulo AS titulo, COUNT(v.id) AS total
FROM visualizacao_imovel v
INNER JOIN imovel i ON v.imovel_id = i.id
WHERE i.conta_site_id = ?
GROUP BY i.id, i.titulo
ORDER BY total DESC, i.id DESC
LIMIT 5
"""