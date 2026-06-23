# Tutorial passo a passo — Contador de visualizações do imóvel + Ordenar catálogo público

Este tutorial é para alunos de graduação. Vamos com calma e **sem pular nada**. Se você seguir cada passo na ordem, ao final terá as duas features funcionando de ponta a ponta (backend + frontend). Leia com atenção, copie os códigos exatamente como estão e confira cada caminho de arquivo.

---

## O que você vai construir

Você vai implementar **duas features** no projeto CAVI (um SaaS imobiliário onde cada corretor tem um catálogo público com imóveis). A primeira é um **contador de visualizações**: toda vez que um visitante abre a página de detalhe de um imóvel, o sistema registra essa visita em uma tabela nova (`visualizacao_imovel`). Com esses dados, o painel do corretor (dashboard) ganha um bloco "Imóveis mais vistos" (top 5) e um número de "Total de acessos". A segunda feature é a **ordenação do catálogo público**: o visitante poderá escolher como os imóveis aparecem (mais recentes, menor preço, maior preço) através de um seletor na tela, que envia um parâmetro `ordenar` para a API e muda o `ORDER BY` da consulta no banco.

Resultado final:

- Nova tabela `visualizacao_imovel` criada automaticamente quando o backend sobe.
- Cada `GET /api/publico/imoveis/{id}` registra uma linha de visualização.
- Novo endpoint `GET /api/imoveis/visualizacoes` que devolve o total de acessos e o top 5 de imóveis mais vistos do corretor logado.
- Dashboard do corretor com um card "Total de acessos" e uma lista "Imóveis mais vistos".
- Novo query param `ordenar` em `GET /api/publico/catalogo/{slug}/imoveis` com os valores `recentes`, `preco_asc`, `preco_desc`.
- Seletor de ordenação na `CatalogPage` (tela pública do catálogo).

---

## Pré-requisitos

Antes de começar, deixe **backend e frontend rodando** ao mesmo tempo, em dois terminais separados.

**Terminal 1 — backend** (a partir da raiz do projeto):

```bash
backend/.venv/bin/python backend/main.py
```

> O backend sobe na porta **8411**. A documentação interativa (Swagger) fica em `http://localhost:8411/docs`. Use o interpretador do venv (`backend/.venv/bin/python`), nunca o `python` global.

**Terminal 2 — frontend** (a partir da pasta `frontend/`):

```bash
cd frontend
npm run dev
```

> O Vite sobe na porta **5181** e faz proxy de `/api`, `/static` e `/health` para o backend. Abra `http://localhost:5181` no navegador.

Para testar a área do corretor você precisa estar **logado como corretor** e já ter um catálogo com pelo menos um imóvel publicado. Se ainda não tiver, cadastre um corretor pela tela `/login` (aba de cadastro) e crie um imóvel em `/app/imoveis/novo`, deixando-o como **Publicado**.

---

## As camadas que vamos tocar e a ordem de implementação

O CAVI segue a arquitetura **Routes → DTOs → Repos → SQL → DB** no backend e **api → types → schemas → páginas → router** no frontend. Vamos implementar **de baixo para cima**: primeiro o banco, depois o que usa o banco, e por último a tela. Fazemos assim porque cada camada **depende** da camada de baixo: a rota só funciona se o repo existir, o repo só funciona se o SQL existir, e a tela só funciona se a API já estiver respondendo. Se você começasse pela tela, não teria o que testar.

Ordem completa:

**Feature A — Contador de visualizações**

1. **SQL** — `backend/sql/visualizacao_imovel_sql.py` (NOVO): `CREATE TABLE` + queries de inserir, contar e top 5.
2. **Repo** — `backend/repo/visualizacao_imovel_repo.py` (NOVO): `criar_tabela()`, `registrar()`, `contar_por_conta()`, `top_mais_vistos()`.
3. **Registrar a tabela no startup** — `backend/main.py` (EDIÇÃO): importar o repo e adicioná-lo à lista `TABELAS`.
4. **Rota de registro** — `backend/routes/publico_routes.py` (EDIÇÃO): no `GET /publico/imoveis/{id}`, chamar `registrar()`.
5. **Response DTO** — `backend/dtos/responses/visualizacao_response.py` (NOVO): formato do payload do dashboard.
6. **Rota do dashboard** — `backend/routes/imoveis_routes.py` (EDIÇÃO): novo `GET /imoveis/visualizacoes`.
7. **Frontend tipos** — `frontend/src/lib/types.ts` (EDIÇÃO): tipos espelhando o response.
8. **Frontend dashboard** — `frontend/src/pages/corretor/DashboardCorretorPage.tsx` (EDIÇÃO): card + lista.

**Feature B — Ordenar catálogo**

9. **SQL** — `backend/sql/imovel_sql.py` (EDIÇÃO): constantes de `ORDER BY` por critério.
10. **Repo** — `backend/repo/imovel_repo.py` (EDIÇÃO): parâmetro `ordenar` em `listar_por_conta`.
11. **Rota** — `backend/routes/publico_routes.py` (EDIÇÃO): query param `ordenar` repassado ao repo.
12. **Frontend catálogo** — `frontend/src/pages/catalogo/CatalogPage.tsx` (EDIÇÃO): seletor de ordenação.

---

# FEATURE A — Contador de visualizações

## Passo 1 — SQL da nova tabela

### Arquivo: `backend/sql/visualizacao_imovel_sql.py` — ARQUIVO NOVO

Crie este arquivo. Ele guarda **só strings de SQL** (prepared statements, sempre com `?`). É o mesmo estilo do `imovel_sql.py` que já existe no projeto.

```python
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
```

Pontos importantes:

- `CREATE TABLE IF NOT EXISTS` — não dá erro se a tabela já existir (o startup roda isso toda vez).
- `id INTEGER PRIMARY KEY AUTOINCREMENT` — padrão de chave primária do projeto.
- `data_visualizacao TIMESTAMP` — coluna de data, exatamente como nas outras tabelas.
- `FOREIGN KEY (imovel_id) ... ON DELETE CASCADE` — se o imóvel for excluído, as visualizações dele somem junto.
- `CONTAR_POR_CONTA` e `TOP_MAIS_VISTOS` usam `INNER JOIN imovel` porque a tabela de visualização não sabe de qual corretor é o imóvel; o `conta_site_id` mora na tabela `imovel`.
- `GROUP BY` + `COUNT(...)` é uma **agregação**: agrupa por imóvel e conta quantas linhas existem.

---

## Passo 2 — Repositório

### Arquivo: `backend/repo/visualizacao_imovel_repo.py` — ARQUIVO NOVO

Crie este arquivo. Ele é a camada que **executa** o SQL. Repare que copiamos fielmente o estilo do `imovel_repo.py`: conexão via `with obter_conexao()`, datas via `agora()`, e a função `criar_tabela()`.

```python
"""
Repositório de Visualização de Imóvel (tabela ``visualizacao_imovel``).

Camada Repos da arquitetura Routes -> DTOs -> Repos -> SQL -> DB. SQL puro com
prepared statements, sem ORM. Datas de gravação usam ``agora()`` (NUNCA
``strftime``).
"""

from sql.visualizacao_imovel_sql import (
    CRIAR_TABELA,
    REGISTRAR,
    CONTAR_POR_CONTA,
    TOP_MAIS_VISTOS,
)
from util.db_util import obter_conexao
from util.datetime_util import agora


# ===================== TABELA =====================


def criar_tabela() -> bool:
    """Cria a tabela de visualizações (chamada no startup pelo main.py)."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA)
        return True


# ===================== REGISTRO =====================


def registrar(imovel_id: int) -> bool:
    """Registra uma visualização (um acesso) do imóvel informado."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(REGISTRAR, (imovel_id, agora()))
        return cursor.lastrowid is not None


# ===================== CONTADORES (DASHBOARD) =====================


def contar_por_conta(conta_site_id: int) -> int:
    """Total de acessos a todos os imóveis de uma conta-site."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CONTAR_POR_CONTA, (conta_site_id,))
        row = cursor.fetchone()
        return row["total"] if row else 0


def top_mais_vistos(conta_site_id: int) -> list[dict]:
    """Top 5 imóveis mais vistos de uma conta-site.

    Retorna uma lista de dicts ``{imovel_id, titulo, total}`` já ordenada do
    mais visto para o menos visto.
    """
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(TOP_MAIS_VISTOS, (conta_site_id,))
        return [
            {
                "imovel_id": row["imovel_id"],
                "titulo": row["titulo"],
                "total": row["total"],
            }
            for row in cursor.fetchall()
        ]
```

Pontos importantes:

- `criar_tabela()` mora **no repo**, não no SQL. É essa função que o `main.py` chama no startup.
- `registrar()` usa `agora()` (de `util/datetime_util.py`) para a data. **Nunca** use `datetime.now()` nem `.strftime()` — é regra do projeto.
- Todos os métodos abrem a conexão com `with obter_conexao() as conn:`, que faz commit/rollback sozinho e ativa as foreign keys.
- O SQL é sempre passado com **tupla de parâmetros** (`(imovel_id, agora())`), nunca com f-string. Isso evita SQL injection.
- `row["total"]` funciona porque o projeto usa `row_factory = sqlite3.Row`, que permite acessar colunas pelo nome.

---

## Passo 3 — Registrar a tabela no startup (PASSO QUE MAIS GENTE ESQUECE)

### Arquivo: `backend/main.py` — EDIÇÃO

Sem este passo, a tabela `visualizacao_imovel` **nunca é criada** e você vai tomar um erro `no such table` ao acessar o detalhe de um imóvel. São duas mudanças pequenas no `main.py`.

**Mudança 3.1 — importar o novo repo.** Localize, perto do topo do arquivo, a linha que importa os repos do módulo de imóveis:

```python
from repo import conta_site_repo, imovel_repo, foto_imovel_repo
```

Adicione o novo repo nessa mesma importação:

```python
from repo import conta_site_repo, imovel_repo, foto_imovel_repo, visualizacao_imovel_repo
```

**Mudança 3.2 — adicionar à lista `TABELAS`.** Localize a lista `TABELAS` (logo abaixo do comentário "Criação de tabelas e seed"):

```python
TABELAS = [
    (usuario_repo, "usuario"),
    (conta_site_repo, "conta_site"),
    # imovel_repo.criar_tabela cria as três tabelas do módulo na ordem correta
    # de dependência: imovel -> endereco_imovel (1:1) -> foto_imovel (1:N).
    (imovel_repo, "imovel + endereco_imovel + foto_imovel"),
    (configuracao_repo, "configuracao"),
]
```

Adicione a entrada do novo repo **depois** de `imovel_repo` (a ordem importa: a tabela `visualizacao_imovel` tem FK para `imovel`, então `imovel` precisa existir antes):

```python
TABELAS = [
    (usuario_repo, "usuario"),
    (conta_site_repo, "conta_site"),
    # imovel_repo.criar_tabela cria as três tabelas do módulo na ordem correta
    # de dependência: imovel -> endereco_imovel (1:1) -> foto_imovel (1:N).
    (imovel_repo, "imovel + endereco_imovel + foto_imovel"),
    (visualizacao_imovel_repo, "visualizacao_imovel"),
    (configuracao_repo, "configuracao"),
]
```

O `main.py` tem um loop que percorre `TABELAS` e chama `repo.criar_tabela()` para cada um. Ao adicionar a tupla, sua tabela passa a ser criada no startup. **Reinicie o backend** (Ctrl+C no Terminal 1 e suba de novo) e confira no log a linha `Tabela 'visualizacao_imovel' criada/verificada`.

---

## Passo 4 — Registrar a visualização na rota pública

### Arquivo: `backend/routes/publico_routes.py` — EDIÇÃO

Agora vamos gravar uma visualização **toda vez** que alguém abrir o detalhe público de um imóvel.

**Mudança 4.1 — importar o repo.** Localize a importação dos repos no topo do arquivo:

```python
# Repositories
from repo import conta_site_repo, imovel_repo
```

Adicione o novo repo:

```python
# Repositories
from repo import conta_site_repo, imovel_repo, visualizacao_imovel_repo
```

**Mudança 4.2 — registrar dentro do `obter_imovel`.** Localize a função `obter_imovel` (decorada com `@router.get("/imoveis/{id}", ...)`). Ela termina assim:

```python
    conta = conta_site_repo.obter_por_id(imovel.conta_site_id)
    if not conta or conta.status != StatusConta.ATIVO:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imóvel não encontrado.",
        )

    return ImovelPublicoDetalheResponse(
        imovel=ImovelResponse.de_imovel(imovel),
        catalogo=CatalogoPublicoResponse.de_conta(conta),
    )
```

Adicione a chamada `registrar(...)` logo **antes** do `return`, depois de já ter validado que o imóvel existe, está publicado e a conta está ativa:

```python
    conta = conta_site_repo.obter_por_id(imovel.conta_site_id)
    if not conta or conta.status != StatusConta.ATIVO:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imóvel não encontrado.",
        )

    # Registra uma visualização deste imóvel (contador do dashboard do corretor).
    visualizacao_imovel_repo.registrar(imovel.id)

    return ImovelPublicoDetalheResponse(
        imovel=ImovelResponse.de_imovel(imovel),
        catalogo=CatalogoPublicoResponse.de_conta(conta),
    )
```

Pontos importantes:

- Registramos **só depois** de confirmar que o imóvel existe e está publicado. Assim não contamos acessos a imóveis ocultos ou inexistentes (esses casos já caíram no 404 antes).
- Esta é uma rota `GET` pública (sem login). GETs não exigem CSRF no projeto, então não precisa se preocupar com token aqui.

---

## Passo 5 — Response DTO do dashboard de visualizações

### Arquivo: `backend/dtos/responses/visualizacao_response.py` — ARQUIVO NOVO

Crie este arquivo. Ele define o **formato exato** do JSON que a API vai devolver para o dashboard. É o contrato que o frontend vai espelhar.

```python
"""
Schemas de resposta do dashboard de visualizações (módulo Visualização).

Expõem o total de acessos e o ranking dos imóveis mais vistos de uma conta-site
(catálogo do corretor). Tipos espelhados em ``frontend/src/lib/types.ts``.
"""

from pydantic import BaseModel, Field


class ImovelMaisVistoResponse(BaseModel):
    """Uma linha do ranking de imóveis mais vistos."""

    imovel_id: int
    titulo: str
    total: int = Field(..., description="Quantidade de visualizações do imóvel")

    @classmethod
    def de_dict(cls, dados: dict) -> "ImovelMaisVistoResponse":
        """Constrói a partir do dict retornado pelo repositório."""
        return cls(
            imovel_id=dados["imovel_id"],
            titulo=dados["titulo"],
            total=dados["total"],
        )


class VisualizacoesDashboardResponse(BaseModel):
    """Payload do bloco de visualizações no dashboard do corretor."""

    total_acessos: int = Field(
        ..., description="Total de acessos a todos os imóveis da conta"
    )
    mais_vistos: list[ImovelMaisVistoResponse] = Field(
        default_factory=list, description="Top 5 imóveis mais vistos"
    )
```

Pontos importantes:

- Os nomes dos campos (`total_acessos`, `mais_vistos`, `imovel_id`, `titulo`, `total`) precisam bater **exatamente** com os tipos do frontend (Passo 7). Se mudar um nome aqui, mude lá também.
- O classmethod `de_dict` segue o padrão `de_<algo>` usado em todos os response DTOs do projeto (como `de_conta`, `de_imovel`).
- `default_factory=list` garante que `mais_vistos` seja uma lista vazia quando não houver dados (em vez de erro).

---

## Passo 6 — Rota do dashboard de visualizações

### Arquivo: `backend/routes/imoveis_routes.py` — EDIÇÃO

Vamos criar um endpoint novo na área do corretor: `GET /imoveis/visualizacoes`. Ele exige login e devolve os dados da conta do corretor logado.

**Mudança 6.1 — importar o repo e o response.** No topo do arquivo, localize a importação dos repos:

```python
# Repositories
from repo import conta_site_repo, foto_imovel_repo, imovel_repo
```

Adicione o novo repo:

```python
# Repositories
from repo import conta_site_repo, foto_imovel_repo, imovel_repo, visualizacao_imovel_repo
```

Em seguida, localize as importações dos schemas de saída:

```python
# Schemas (saída)
from dtos.responses.comum import MensagemResponse, PaginaResponse
from dtos.responses.imovel_response import ImovelResponse, ImovelResumoResponse
```

Adicione a importação do novo response:

```python
# Schemas (saída)
from dtos.responses.comum import MensagemResponse, PaginaResponse
from dtos.responses.imovel_response import ImovelResponse, ImovelResumoResponse
from dtos.responses.visualizacao_response import (
    ImovelMaisVistoResponse,
    VisualizacoesDashboardResponse,
)
```

**Mudança 6.2 — criar o endpoint.** Localize a função `dashboard` (decorada com `@router.get("/dashboard")`). Logo **depois** dela (antes da seção de Listagem), adicione o novo endpoint:

```python
# =============================================================================
# Dashboard de visualizações
# =============================================================================

@router.get("/visualizacoes", response_model=VisualizacoesDashboardResponse)
@requer_autenticacao()
async def visualizacoes(
    request: Request,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Total de acessos e top 5 de imóveis mais vistos da conta do corretor."""
    assert usuario_logado is not None
    conta = _obter_conta_do_usuario(usuario_logado)

    total = visualizacao_imovel_repo.contar_por_conta(conta.id)
    mais_vistos = visualizacao_imovel_repo.top_mais_vistos(conta.id)

    return VisualizacoesDashboardResponse(
        total_acessos=total,
        mais_vistos=[ImovelMaisVistoResponse.de_dict(m) for m in mais_vistos],
    )
```

Pontos importantes:

- `@requer_autenticacao()` sem argumentos = qualquer usuário logado. O decorator injeta o `usuario_logado` (por isso ele aparece como `Optional[...] = None` na assinatura). O `assert` é só para o type checker entender que ele não é `None` daqui pra frente.
- `request: Request` vem primeiro, `usuario_logado` por último — é a ordem padrão das rotas do projeto.
- `_obter_conta_do_usuario(usuario_logado)` é um helper que já existe neste arquivo; ele resolve a conta-site do corretor logado (e dá 404 se ele ainda não tem catálogo).
- Coloque a rota `/visualizacoes` **antes** da rota `/{id}` (que está mais abaixo). Como `/visualizacoes` é um caminho fixo e `/{id}` é variável, se a fixa vier depois o FastAPI ainda resolve corretamente (caminhos literais têm prioridade), mas por clareza deixamos a fixa junto do `/dashboard`, no topo.

> **Importante sobre o router:** você **não** precisa registrar nada novo no `main.py` para este endpoint. O `imoveis_router` já está registrado lá (na lista `ROUTERS`). Você só registra no `main.py` quando cria um **arquivo de router novo**. Aqui só adicionamos uma rota a um router que já existe.

Teste no Swagger: reinicie o backend, abra `http://localhost:8411/docs`, e confira que apareceu `GET /api/imoveis/visualizacoes`.

---

## Passo 7 — Tipos no frontend

### Arquivo: `frontend/src/lib/types.ts` — EDIÇÃO

Agora o frontend. Primeiro espelhamos o response DTO em tipos TypeScript. Vá ao **final** do arquivo `types.ts` e adicione:

```ts
// ===== Visualizações (dashboard do corretor) =====
// Espelha backend/dtos/responses/visualizacao_response.py.
export interface ImovelMaisVisto {
  imovel_id: number
  titulo: string
  total: number
}

export interface VisualizacoesDashboard {
  total_acessos: number
  mais_vistos: ImovelMaisVisto[]
}
```

Pontos importantes:

- Os nomes (`total_acessos`, `mais_vistos`, `imovel_id`, `titulo`, `total`) batem exatamente com o response DTO do backend (Passo 5). É o "contrato espelhado": mudou de um lado, espelhe no outro.
- Tipos numéricos do Python (`int`) viram `number` no TypeScript.
- Como essa feature não tem formulário de entrada (só leitura), **não** precisamos criar nada em `schemas.ts` (os schemas Zod são para validar formulários de envio).

---

## Passo 8 — Dashboard do corretor

### Arquivo: `frontend/src/pages/corretor/DashboardCorretorPage.tsx` — EDIÇÃO

Vamos buscar os dados de visualizações e mostrá-los: um card "Total de acessos" e uma lista "Imóveis mais vistos".

**Mudança 8.1 — importar o tipo novo.** Localize a linha de import de tipos:

```ts
import type { ContaSite, ImovelResumo, PaginaResponse } from '../../lib/types'
```

Adicione o tipo `VisualizacoesDashboard`:

```ts
import type { ContaSite, ImovelResumo, PaginaResponse, VisualizacoesDashboard } from '../../lib/types'
```

**Mudança 8.2 — buscar os dados.** Dentro do componente `DashboardCorretorPage`, localize o último `useFetch` (o que busca `recentesPagina`):

```ts
  const { data: recentesPagina } = useFetch<PaginaResponse<ImovelResumo>>(
    (signal) => api.get<PaginaResponse<ImovelResumo>>('/imoveis', {
      params: { pagina: 1, por_pagina: 4 },
      signal,
    }),
    [],
  )
```

Logo **depois** dele, adicione um novo `useFetch` para as visualizações:

```ts
  const { data: visualizacoes } = useFetch<VisualizacoesDashboard>(
    (signal) => api.get<VisualizacoesDashboard>('/imoveis/visualizacoes', { signal }),
    [],
  )
```

E logo abaixo das variáveis derivadas (`const recentes = recentesPagina?.items ?? []`), adicione:

```ts
  const totalAcessos = visualizacoes?.total_acessos ?? 0
  const maisVistos = visualizacoes?.mais_vistos ?? []
```

> Repare no padrão `?? 0` e `?? []`: enquanto os dados não chegam, `visualizacoes` é `undefined`, então usamos valores padrão para a tela não quebrar.

**Mudança 8.3 — mostrar o card "Total de acessos".** Localize a grade de cards de estatística (`StatCard`):

```tsx
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard label="Imóveis" value={total} />
        <StatCard label="Publicados" value={publicados} valueColor={colors.greenText} />
        <StatCard label="Ocultos" value={ocultos} valueColor="#a89f90" />
      </div>
```

Troque para 4 colunas e adicione o card de acessos:

```tsx
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard label="Imóveis" value={total} />
        <StatCard label="Publicados" value={publicados} valueColor={colors.greenText} />
        <StatCard label="Ocultos" value={ocultos} valueColor="#a89f90" />
        <StatCard label="Total de acessos" value={totalAcessos} valueColor={colors.orange} />
      </div>
```

**Mudança 8.4 — mostrar a lista "Imóveis mais vistos".** Localize a coluna lateral direita do dashboard. Ela é o segundo filho desta `div`:

```tsx
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 20, margin: '0 0 16px' }}>
              Atalhos
            </h2>
```

Logo **antes** do bloco "Atalhos" (ou seja, como primeiro filho dessa coluna), adicione o card de mais vistos:

```tsx
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 20, margin: '0 0 16px' }}>
              Imóveis mais vistos
            </h2>
            {maisVistos.length === 0 ? (
              <p style={{ color: colors.mutedSoft, fontSize: 14, margin: 0 }}>
                Nenhuma visualização registrada ainda.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {maisVistos.map((mv) => (
                  <div
                    key={mv.imovel_id}
                    onClick={() => navigate(`/app/imoveis/${mv.imovel_id}/editar`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 10,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = colors.bg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {mv.titulo}
                    </div>
                    <div style={{ flex: 'none', fontSize: 13, color: colors.orange, fontWeight: 700 }}>
                      {mv.total} {mv.total === 1 ? 'acesso' : 'acessos'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 20, margin: '0 0 16px' }}>
              Atalhos
            </h2>
```

Pontos importantes:

- Reutilizamos exatamente os mesmos tokens (`colors`, `fonts`) e o estilo inline do projeto. **Nada de Bootstrap ou classes** — é regra do CAVI.
- Clicar num imóvel mais visto leva para a edição dele (`navigate(\`/app/imoveis/${mv.imovel_id}/editar\`)`), igual ao comportamento dos imóveis recentes.
- Tratamos a lista vazia com uma mensagem amigável.
- Você **não** precisa mexer no `router.tsx` nem na sidebar nesta feature: o dashboard já é uma página existente (rota `index` de `/app`). Só editamos o conteúdo dela.

Para passar no typecheck, lembre de rodar `npx tsc -b --noEmit` na pasta `frontend/` (o projeto usa modo estrito; imports não usados ou tipos errados quebram o build).

---

# FEATURE B — Ordenar catálogo público

## Passo 9 — SQL das ordenações

### Arquivo: `backend/sql/imovel_sql.py` — EDIÇÃO

Hoje a listagem tem uma ordenação fixa. Vamos adicionar opções. Localize, na seção "LISTAGEM / FILTROS", a constante de ordenação:

```python
# Ordenação fixa aplicada ao fim das listagens.
ORDENAR_LISTAGEM = " ORDER BY destaque DESC, data_cadastro DESC, id DESC"
```

Logo **abaixo** dela, adicione um mapa de ordenações por critério:

```python
# Ordenações disponíveis no catálogo público (mapeadas pela query param "ordenar").
# "recentes" mantém a regra padrão (destaque primeiro, depois mais novos).
ORDENACOES = {
    "recentes": " ORDER BY destaque DESC, data_cadastro DESC, id DESC",
    "preco_asc": " ORDER BY preco ASC, id DESC",
    "preco_desc": " ORDER BY preco DESC, id DESC",
}
ORDENACAO_PADRAO = "recentes"
```

Pontos importantes:

- Não apague `ORDENAR_LISTAGEM` — a listagem do corretor (área autenticada) continua usando ele. Estamos **adicionando**, não substituindo.
- `ORDENACOES` é um dicionário que mapeia o valor recebido na API (`recentes`, `preco_asc`, `preco_desc`) para o trecho de SQL correto. Como esses valores são **chaves fixas que nós controlamos** (e não dados digitados pelo usuário inseridos direto na string), validamos contra esse dicionário antes de usar — então não há risco de SQL injection.
- `preco_asc` = menor preço primeiro (ascendente). `preco_desc` = maior preço primeiro (descendente).

---

## Passo 10 — Repositório

### Arquivo: `backend/repo/imovel_repo.py` — EDIÇÃO

Vamos ensinar o repo a aceitar o critério de ordenação.

**Mudança 10.1 — importar as novas constantes.** Localize, no bloco de imports do `sql.imovel_sql`, a linha `ORDENAR_LISTAGEM,`:

```python
    FILTRO_PRECO_MAX,
    ORDENAR_LISTAGEM,
    CONTAR_POR_CONTA,
```

Adicione `ORDENACOES` e `ORDENACAO_PADRAO` logo após `ORDENAR_LISTAGEM,`:

```python
    FILTRO_PRECO_MAX,
    ORDENAR_LISTAGEM,
    ORDENACOES,
    ORDENACAO_PADRAO,
    CONTAR_POR_CONTA,
```

**Mudança 10.2 — adicionar o parâmetro `ordenar`.** Localize a função `listar_por_conta`. Ela começa assim:

```python
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
```

Adicione um parâmetro `ordenar` no final da assinatura (com valor padrão `None`, para não quebrar quem já chama a função sem ele):

```python
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
    ordenar: Optional[str] = None,
) -> Paginacao:
```

**Mudança 10.3 — usar o `ordenar` ao montar o SQL.** Dentro dessa mesma função, localize o trecho que monta as queries:

```python
    sql_count = LISTAR_COUNT_BASE + sql_extra
    sql_dados = LISTAR_BASE + sql_extra + ORDENAR_LISTAGEM
    params = tuple([conta_site_id] + params_extra)
```

Troque a linha do `sql_dados` para escolher a ordenação a partir do dicionário `ORDENACOES`:

```python
    # Resolve a ordenação: usa o critério informado se for válido, senão o padrão.
    ordenacao_sql = ORDENACOES.get(ordenar or ORDENACAO_PADRAO, ORDENACOES[ORDENACAO_PADRAO])

    sql_count = LISTAR_COUNT_BASE + sql_extra
    sql_dados = LISTAR_BASE + sql_extra + ordenacao_sql
    params = tuple([conta_site_id] + params_extra)
```

Pontos importantes:

- `ORDENACOES.get(chave, padrao)` devolve o padrão se a chave não existir. Ou seja, se o front mandar um `ordenar` inválido (ou vazio), caímos com segurança na ordenação `recentes`.
- O `sql_count` continua sem `ORDER BY` (contar não precisa ordenar).
- Como `ordenar` tem default `None`, **todas** as chamadas existentes de `listar_por_conta` (inclusive a da área do corretor em `imoveis_routes.py`) continuam funcionando sem alteração.

---

## Passo 11 — Rota pública do catálogo

### Arquivo: `backend/routes/publico_routes.py` — EDIÇÃO

Agora expomos o parâmetro `ordenar` na API pública. Localize a função `listar_imoveis_do_catalogo` (decorada com `@router.get("/catalogo/{slug}/imoveis", ...)`). A assinatura dela é:

```python
async def listar_imoveis_do_catalogo(
    request: Request,
    slug: str,
    pagina: int = 1,
    por_pagina: int = 12,
    finalidade: Optional[str] = None,
    tipo: Optional[str] = None,
    bairro: Optional[str] = None,
    preco_min: Optional[float] = None,
    preco_max: Optional[float] = None,
):
```

Adicione o query param `ordenar` no final:

```python
async def listar_imoveis_do_catalogo(
    request: Request,
    slug: str,
    pagina: int = 1,
    por_pagina: int = 12,
    finalidade: Optional[str] = None,
    tipo: Optional[str] = None,
    bairro: Optional[str] = None,
    preco_min: Optional[float] = None,
    preco_max: Optional[float] = None,
    ordenar: Optional[str] = None,
):
```

Em seguida, dentro da função, localize a chamada ao repo:

```python
    paginacao = imovel_repo.listar_por_conta(
        conta_site_id=conta.id,
        pagina=pagina,
        por_pagina=por_pagina,
        finalidade=finalidade,
        tipo=tipo,
        bairro=bairro,
        preco_min=preco_min,
        preco_max=preco_max,
        somente_publicados=True,
    )
```

Adicione `ordenar=ordenar` na chamada:

```python
    paginacao = imovel_repo.listar_por_conta(
        conta_site_id=conta.id,
        pagina=pagina,
        por_pagina=por_pagina,
        finalidade=finalidade,
        tipo=tipo,
        bairro=bairro,
        preco_min=preco_min,
        preco_max=preco_max,
        somente_publicados=True,
        ordenar=ordenar,
    )
```

Pontos importantes:

- Um parâmetro de função sem path/body, com tipo simples (`Optional[str] = None`), vira automaticamente um **query param** no FastAPI. Ou seja, a URL fica `GET /api/publico/catalogo/{slug}/imoveis?ordenar=preco_asc`.
- Não precisa validar `ordenar` aqui: o repo já cai no padrão quando o valor é desconhecido (Passo 10).
- Não há nada para registrar no `main.py`: `publico_router` já está registrado.

Teste no Swagger: `GET /api/publico/catalogo/{slug}/imoveis` agora tem um campo `ordenar`. Experimente com `preco_asc` e veja os imóveis virem do mais barato para o mais caro.

---

## Passo 12 — Seletor de ordenação na CatalogPage

### Arquivo: `frontend/src/pages/catalogo/CatalogPage.tsx` — EDIÇÃO

Por fim, o seletor na tela pública.

**Mudança 12.1 — guardar a ordenação no estado.** Localize, dentro do componente `CatalogPage`, as declarações de estado:

```ts
  const [f, setF] = useState<Filtros>(FILTROS_VAZIOS)
  const [pagina, setPagina] = useState(1)
```

Adicione um estado para a ordenação (padrão `recentes`):

```ts
  const [f, setF] = useState<Filtros>(FILTROS_VAZIOS)
  const [pagina, setPagina] = useState(1)
  const [ordenar, setOrdenar] = useState('recentes')
```

**Mudança 12.2 — enviar `ordenar` na query.** Localize o `useMemo` que monta os `params`:

```ts
  const params = useMemo(() => {
    const p: Record<string, string | number> = { pagina, por_pagina: POR_PAGINA }
    if (f.finalidade) p.finalidade = f.finalidade
    if (f.tipo) p.tipo = f.tipo
    if (f.bairro.trim()) p.bairro = f.bairro.trim()
    if (f.precoMax) p.preco_max = Number(f.precoMax)
    return p
  }, [pagina, f])
```

Inclua o `ordenar` nos params e na lista de dependências:

```ts
  const params = useMemo(() => {
    const p: Record<string, string | number> = { pagina, por_pagina: POR_PAGINA }
    if (f.finalidade) p.finalidade = f.finalidade
    if (f.tipo) p.tipo = f.tipo
    if (f.bairro.trim()) p.bairro = f.bairro.trim()
    if (f.precoMax) p.preco_max = Number(f.precoMax)
    if (ordenar) p.ordenar = ordenar
    return p
  }, [pagina, f, ordenar])
```

> Adicionar `ordenar` no array de dependências do `useMemo` é o que faz a lista recarregar quando o visitante muda a ordenação (o `useFetch` depende de `params`).

**Mudança 12.3 — adicionar o seletor na barra de filtros.** Localize, dentro da barra de filtros, o `<Select>` de preço máximo seguido do botão "Limpar":

```tsx
          <Select value={f.precoMax} onChange={set('precoMax')}>
            <option value="">Preço máximo</option>
            {PRECOS_MAX.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.rotulo}
              </option>
            ))}
          </Select>
          <button
            onClick={() => {
              setF(FILTROS_VAZIOS)
              setPagina(1)
            }}
```

Adicione um novo `<Select>` de ordenação **entre** o select de preço e o botão "Limpar":

```tsx
          <Select value={f.precoMax} onChange={set('precoMax')}>
            <option value="">Preço máximo</option>
            {PRECOS_MAX.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.rotulo}
              </option>
            ))}
          </Select>
          <Select
            value={ordenar}
            onChange={(e) => {
              setOrdenar(e.target.value)
              setPagina(1)
            }}
          >
            <option value="recentes">Mais recentes</option>
            <option value="preco_asc">Menor preço</option>
            <option value="preco_desc">Maior preço</option>
          </Select>
          <button
            onClick={() => {
              setF(FILTROS_VAZIOS)
              setPagina(1)
            }}
```

**Mudança 12.4 (opcional, recomendado) — resetar a ordenação no "Limpar".** No botão "Limpar", o `onClick` reseta os filtros e a página. Adicione também o reset da ordenação:

```tsx
          <button
            onClick={() => {
              setF(FILTROS_VAZIOS)
              setPagina(1)
              setOrdenar('recentes')
            }}
```

Pontos importantes:

- Os valores das `<option>` (`recentes`, `preco_asc`, `preco_desc`) batem **exatamente** com as chaves do dicionário `ORDENACOES` no backend (Passo 9). Se você escrever diferente, a API cai no padrão e a ordenação não muda.
- Ao mudar a ordenação, voltamos para a página 1 (`setPagina(1)`), porque a ordem muda e não faz sentido manter a página antiga.
- Reusamos o componente `<Select>` que já existe nesse arquivo, mantendo a estética igual aos outros filtros.

---

## Como testar

### Teste manual — Feature A (visualizações)

1. Garanta backend e frontend rodando (Pré-requisitos). **Reinicie o backend** após criar a tabela.
2. No log do backend, confirme: `Tabela 'visualizacao_imovel' criada/verificada`.
3. Tenha um corretor com pelo menos 1 imóvel **Publicado**. Pegue o `slug` do catálogo (aparece no dashboard como `/v/{slug}`).
4. Abra o catálogo público em `http://localhost:5181/v/{slug}` e clique em alguns imóveis para abrir o detalhe. Faça isso várias vezes em imóveis diferentes (cada abertura conta uma visualização).
5. Volte ao painel do corretor em `http://localhost:5181/app`. O card **"Total de acessos"** deve mostrar o número de aberturas, e o bloco **"Imóveis mais vistos"** deve listar os imóveis com mais acessos (ordenados do maior para o menor).
6. Confira no Swagger (`http://localhost:8411/docs`) o endpoint `GET /api/imoveis/visualizacoes` retornando `{ total_acessos, mais_vistos: [...] }`.

### Teste manual — Feature B (ordenação)

1. No catálogo público `http://localhost:5181/v/{slug}`, use o seletor de ordenação.
2. Escolha **"Menor preço"**: os imóveis devem aparecer do mais barato para o mais caro.
3. Escolha **"Maior preço"**: do mais caro para o mais barato.
4. Escolha **"Mais recentes"** (ou clique em "Limpar"): volta à ordem padrão (destaques e mais novos primeiro).
5. Confira no DevTools do navegador (aba Network) que a chamada para `/publico/catalogo/{slug}/imoveis` agora envia `ordenar=preco_asc` (ou o critério escolhido).

### Teste automatizado (opcional)

O projeto usa **pytest** no backend. Você pode escrever um teste de integração simples. Crie `backend/tests/integration/test_visualizacao.py`:

```python
import pytest
from repo import visualizacao_imovel_repo


@pytest.mark.integration
def test_registrar_e_contar(criar_imovel_publicado):
    # criar_imovel_publicado é uma fixture hipotética que devolve (imovel_id, conta_id).
    imovel_id, conta_id = criar_imovel_publicado

    visualizacao_imovel_repo.registrar(imovel_id)
    visualizacao_imovel_repo.registrar(imovel_id)

    assert visualizacao_imovel_repo.contar_por_conta(conta_id) == 2
    top = visualizacao_imovel_repo.top_mais_vistos(conta_id)
    assert top[0]["imovel_id"] == imovel_id
    assert top[0]["total"] == 2
```

Rode com:

```bash
backend/.venv/bin/python -m pytest tests/integration/test_visualizacao.py
```

> Observação: o exemplo usa uma fixture `criar_imovel_publicado` que você precisaria criar ou adaptar a partir dos `conftest.py` existentes em `backend/tests/`. Olhe os testes que já existem para ver como criar um imóvel de teste.

Não esqueça também de rodar o typecheck do frontend:

```bash
cd frontend
npx tsc -b --noEmit
```

---

## Erros comuns e como resolver

1. **`sqlite3.OperationalError: no such table: visualizacao_imovel`** — você esqueceu de registrar a tabela no startup (Passo 3) ou não reiniciou o backend. Confira se `visualizacao_imovel_repo` está importado **e** na lista `TABELAS` no `main.py`, e reinicie o Terminal 1.

2. **O card e a lista aparecem zerados mesmo depois de abrir imóveis** — confira o contrato espelhado: os nomes dos campos no response DTO (`total_acessos`, `mais_vistos`, `imovel_id`, `titulo`, `total`) precisam ser **idênticos** aos do tipo em `types.ts`. Um nome diferente faz o frontend ler `undefined` e cair no `?? 0` / `?? []`. Verifique também, na aba Network, se `GET /imoveis/visualizacoes` está respondendo 200.

3. **A ordenação não muda nada** — o valor do `<option>` no frontend precisa bater com a chave de `ORDENACOES` no backend (`recentes`, `preco_asc`, `preco_desc`). Se escrever, por exemplo, `menor_preco` no front, o backend não encontra a chave e usa o padrão. Confira também se você adicionou `ordenar` ao array de dependências do `useMemo`; sem isso a lista não recarrega.

4. **Erro 401 ao acessar `/imoveis/visualizacoes`** — esse endpoint exige login (`@requer_autenticacao()`). Ele é para a área do corretor (`/app`), não para o público. No frontend, a chamada já passa pelo `lib/api.ts`, que envia o cookie de sessão automaticamente — só certifique-se de estar logado como corretor.

5. **`tsc` reclama de import não usado ou tipo faltando** — o frontend é estrito (`noUnusedLocals`). Se importou `VisualizacoesDashboard` mas não usou (ou vice-versa), o build quebra. Rode `npx tsc -b --noEmit` e corrija o que ele apontar antes de considerar pronto.

6. **CSRF / 403 em alguma chamada** — lembre que **GET não precisa de CSRF**. As duas features usam só GET nas rotas novas, então você não deve enfrentar isso. Se aparecer, é sinal de que você usou `fetch` cru em vez do `lib/api.ts` (que injeta o `X-CSRF-Token` nas mutações automaticamente). Use sempre `api.get/post/...`.

---

## Checklist final

**Feature A — Contador de visualizações**

- [ ] `backend/sql/visualizacao_imovel_sql.py` criado (CREATE TABLE + REGISTRAR + CONTAR_POR_CONTA + TOP_MAIS_VISTOS).
- [ ] `backend/repo/visualizacao_imovel_repo.py` criado (`criar_tabela`, `registrar`, `contar_por_conta`, `top_mais_vistos`).
- [ ] `backend/main.py` editado: `visualizacao_imovel_repo` importado **e** adicionado à lista `TABELAS`.
- [ ] Backend reiniciado e log `Tabela 'visualizacao_imovel' criada/verificada` confirmado.
- [ ] `backend/routes/publico_routes.py` editado: `registrar()` chamado dentro de `obter_imovel`.
- [ ] `backend/dtos/responses/visualizacao_response.py` criado (`ImovelMaisVistoResponse`, `VisualizacoesDashboardResponse`).
- [ ] `backend/routes/imoveis_routes.py` editado: endpoint `GET /imoveis/visualizacoes` criado.
- [ ] `frontend/src/lib/types.ts` editado: `ImovelMaisVisto` e `VisualizacoesDashboard` adicionados.
- [ ] `frontend/src/pages/corretor/DashboardCorretorPage.tsx` editado: card "Total de acessos" + bloco "Imóveis mais vistos".

**Feature B — Ordenar catálogo**

- [ ] `backend/sql/imovel_sql.py` editado: `ORDENACOES` e `ORDENACAO_PADRAO` adicionados.
- [ ] `backend/repo/imovel_repo.py` editado: import das novas constantes + parâmetro `ordenar` em `listar_por_conta` + uso do dicionário.
- [ ] `backend/routes/publico_routes.py` editado: query param `ordenar` em `listar_imoveis_do_catalogo` repassado ao repo.
- [ ] `frontend/src/pages/catalogo/CatalogPage.tsx` editado: estado `ordenar`, param na query, `<Select>` de ordenação e reset no "Limpar".

**Geral**

- [ ] Backend sobe sem erros e o Swagger mostra os endpoints novos/alterados.
- [ ] `npx tsc -b --noEmit` passa sem erros no frontend.
- [ ] Teste manual das duas features feito no navegador (porta 5181).
```
