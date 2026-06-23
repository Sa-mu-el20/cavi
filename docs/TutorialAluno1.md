# Tutorial: CRUD N:N de Comodidades do imóvel

> Para alunos que estão começando. Aqui nada é pulado. Se você seguir cada passo **na ordem**, **copiando o código exatamente como está**, a feature vai funcionar do banco de dados até a tela.

---

## Setup: preparando seu computador do zero

Antes de programar qualquer coisa, você precisa deixar o computador pronto. Esta seção parte do zero: instala os programas, baixa o projeto e o deixa rodando na sua máquina. Faça **na ordem**, do começo ao fim. Se você já tem alguma das ferramentas, só confira a versão e siga em frente.

### O que vamos instalar (e para que serve cada um)

- **Git** — guarda o histórico do código e baixa o projeto da internet. É a ferramenta que "copia" o repositório para o seu computador.
- **Python 3.11 ou mais novo** — a linguagem do backend (a parte que fala com o banco de dados).
- **Bun** — o programa que instala as bibliotecas do frontend e roda a parte visual do site. Neste projeto o Bun é a ferramenta oficial; **não use npm** (mais adiante explico o porquê).
- **VSCode** — o editor de código onde você vai escrever tudo.

### 1. Instalar o Git

- **Windows**: baixe em [git-scm.com](https://git-scm.com) e instale com as opções padrão (basta ir clicando em "Next").
- **macOS**: rode `xcode-select --install` no Terminal, ou instale via [Homebrew](https://brew.sh) com `brew install git`.
- **Linux (Ubuntu/Debian)**: `sudo apt update && sudo apt install git`.

Confira se funcionou (a versão exata não importa, só precisa aparecer alguma):

```bash
git --version
```

### 2. Instalar o Python 3.11+

Baixe em [python.org/downloads](https://www.python.org/downloads/). Pegue uma versão **3.11 ou mais nova** (3.11, 3.12, 3.13...).

> No Windows, na tela do instalador marque a caixa **"Add Python to PATH"** antes de clicar em instalar. Sem isso, o comando `python` não vai funcionar no terminal.

Confira:

```bash
python --version
```

> **Atenção a uma pegadinha deste projeto:** existe um arquivo chamado `.python-version` que pede a versão `3.14`. Essa versão pode nem existir ainda no seu computador, e isso atrapalha algumas ferramentas que leem esse arquivo (como o `pyenv`). Por isso, neste tutorial nós vamos criar o ambiente do Python **apontando direto para o Python 3.11** que você instalou, ignorando o que está escrito no `.python-version`. Mais abaixo eu mostro exatamente o comando.

### 3. Instalar o Bun

O Bun é o gerenciador que cuida das bibliotecas e do servidor do frontend.

- **macOS / Linux**:

```bash
curl -fsSL https://bun.sh/install | bash
```

- **Windows (PowerShell)**:

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Feche e abra o terminal de novo e confira:

```bash
bun --version
```

### 4. Instalar o VSCode

Baixe em [code.visualstudio.com](https://code.visualstudio.com) e instale com as opções padrão.

### 5. Extensões do VSCode (instale todas)

Abra o VSCode, clique no ícone de **Extensões** na barra lateral (ou aperte `Ctrl+Shift+X` / `Cmd+Shift+X`) e busque cada uma pelo nome:

- **Python** — dá suporte à linguagem Python (rodar, depurar, autocompletar).
- **Pylance** — deixa o autocompletar e a checagem de tipos do Python bem mais inteligentes.
- **Python Debugger** — permite rodar o código pausando linha por linha para achar erros.
- **Python Environments** — ajuda a escolher e gerenciar o ambiente Python (a `.venv`) do projeto.
- **ESLint** — aponta erros e problemas de estilo no código JavaScript/TypeScript do frontend.
- **SQLite3 Editor** — abre e mostra o banco de dados SQLite direto dentro do editor.
- **vscode-icons** — coloca ícones bonitos nos arquivos, fica mais fácil de se achar.
- **HTML CSS Support** — autocompletar para classes e estilos em HTML/CSS.

### 6. Baixar (clonar) o projeto

"Clonar" é baixar uma cópia completa do repositório, com todo o histórico. Escolha uma pasta e rode:

```bash
git clone https://github.com/Sa-mu-el20/cavi.git
```

Isso cria a pasta `cavi`. Abra ela no VSCode (menu **File → Open Folder** e escolha `cavi`).

### 7. Criar uma branch para o seu trabalho

Uma **branch** é uma linha de trabalho separada. Você cria uma cópia paralela do código, mexe nela à vontade, e o código principal continua intacto. Se algo der errado, é só voltar para a branch principal sem ter estragado nada. Por isso a gente sempre trabalha numa branch própria, em vez de mexer direto na principal.

Dentro da pasta do projeto, crie e já entre na sua branch:

```bash
git checkout -b minha-feature
```

A partir daqui, tudo que você fizer fica guardado nessa branch `minha-feature`.

### 8. Preparar o backend (Python)

Entre na pasta do backend e crie um **ambiente virtual** (a `.venv`). O ambiente virtual é uma "caixinha" isolada onde as bibliotecas do projeto ficam, sem bagunçar o Python do resto do computador.

Lembra da pegadinha do `.python-version`? É aqui que ela importa. Crie a `.venv` chamando explicitamente o Python 3.11:

```bash
cd backend
python3.11 -m venv .venv
```

> Se `python3.11` não funcionar, tente `python -m venv .venv` (mas confirme antes com `python --version` que ele é mesmo 3.11 ou mais novo).

Agora **ative** o ambiente (isso faz o terminal passar a usar o Python da caixinha):

- **macOS / Linux**:

```bash
source .venv/bin/activate
```

- **Windows (PowerShell)**:

```powershell
.venv\Scripts\Activate.ps1
```

Com a `.venv` ativa, instale as bibliotecas que o backend precisa:

```bash
pip install -r requirements.txt
```

### 9. Preparar o frontend (Bun)

Em outro terminal, entre na pasta do frontend e instale as bibliotecas dele com o Bun:

```bash
cd frontend
bun install
```

> **Por que Bun e não npm?** Neste projeto o Bun é o gerenciador oficial. Misturar npm e Bun pode gerar arquivos de trava (lockfiles) diferentes e versões conflitantes de bibliotecas. Para evitar dor de cabeça, use sempre Bun. Se em algum lugar da internet você ver um comando com `npm`, troque pelo equivalente em Bun (`npm install` → `bun install`, `npm run dev` → `bun run dev`).

### 10. Rodar tudo

Você vai precisar de **dois terminais abertos ao mesmo tempo**: um para o backend, outro para o frontend.

**Terminal 1 — backend** (na pasta `backend/`, com a `.venv` ativa):

```bash
.venv/bin/python main.py
```

Isso sobe a API em `http://localhost:8411`.

**Terminal 2 — frontend** (na pasta `frontend/`):

```bash
bun run dev
```

Isso sobe o site em `http://localhost:5181`. Abra esse endereço no navegador: se aparecer a tela do cavi, o setup deu certo e você está pronto para começar o tutorial.

---

## O que você vai construir

Você vai criar uma "coisa" nova no sistema chamada **Característica** (também chamada de "comodidade" — por exemplo: *Piscina*, *Churrasqueira*, *Academia*, *Portaria 24h*). O administrador da plataforma cadastra essas comodidades numa tela só dele. Essa tela é um **CRUD**: a sigla, em inglês, junta as quatro ações básicas sobre dados — **C**riar, **R**ead (ler/listar), **U**pdate (editar) e **D**elete (excluir). Em português: cadastrar, ver, editar e apagar.

Depois, quando o **corretor** edita um imóvel, ele marca em **caixinhas de seleção** (os *checkboxes*) quais comodidades aquele imóvel tem. Na página pública do imóvel (a que o visitante do site vê), essas comodidades aparecem como **tags** (aquelas etiquetas em formato de pílula colorida).

Aqui entra o ponto central do tutorial. Um imóvel pode ter várias comodidades, e uma mesma comodidade (digamos, "Piscina") pode aparecer em vários imóveis diferentes. Quando os dois lados podem ter "muitos" do outro, a gente chama isso de relação **N:N (muitos-para-muitos)**. Para guardar esse tipo de relação no banco de dados, não dá para colocar tudo numa tabela só: a gente cria uma terceira tabela, a **tabela de junção** (aqui, `imovel_caracteristica`), cujo único trabalho é anotar quais pares "imóvel + comodidade" existem.

Resultado final, item por item:

- Uma tabela nova `caracteristica` (o catálogo de comodidades).
- Uma tabela de junção `imovel_caracteristica` (liga imóvel ↔ característica).
- Um repositório `caracteristica_repo` com o CRUD + funções `vincular`, `desvincular` e `listar_por_imovel`.
- Um **DTO** de entrada para criar/editar característica e a lista de características dentro das respostas de imóvel. DTO (do inglês *Data Transfer Object*, "objeto de transferência de dados") é só um molde que descreve o formato dos dados que entram ou saem da API — serve para validar o que o navegador manda e para padronizar o que a API responde.
- Uma rota CRUD de administrador no **endpoint** `/api/admin/caracteristicas` (endpoint é um endereço da API; cada endereço atende a um tipo de pedido), e um ajuste em `imoveis_routes` para salvar e devolver os vínculos.
- No frontend: tipos em `types.ts`, schema Zod em `schemas.ts`, chamadas via `api.ts`.
- Uma página admin de comodidades, checkboxes no formulário de imóvel e tags no detalhe público.

No fim, o visitante vê as comodidades como tags na página do imóvel, mais ou menos assim:

![Detalhe público do imóvel com as comodidades exibidas como tags coloridas](img/aluno1/detalhe-publico-tags.png)

---

## Pré-requisitos

Se você seguiu a seção de **Setup** lá em cima, já tem tudo pronto. Aqui é só um lembrete de como deixar o projeto **cavi** rodando (backend + frontend). Abra **dois terminais**.

**Terminal 1 — backend** (rode a partir da pasta `backend/`):

```bash
backend/.venv/bin/python main.py
```

Isso sobe a API em `http://localhost:8411`. A documentação interativa fica em `http://localhost:8411/docs`.

**Terminal 2 — frontend** (rode a partir da pasta `frontend/`):

```bash
bun run dev
```

Isso sobe o Vite em `http://localhost:5181`. O Vite é o servidor que monta a parte visual do site. Ele também faz *proxy* de `/api` para o backend — ou seja, ele redireciona os pedidos que começam com `/api` para a API, então você acessa tudo por um endereço só, `http://localhost:5181`.

> Dica: para testar telas de admin, exista um usuário admin seed (`cavi@ifes.site`). Veja `backend/data/admin_seed.json`.

Sempre que você mexer no **backend**, pare (`Ctrl+C`) e suba de novo (ou deixe o `reload` recarregar sozinho). Sempre que mexer no **frontend**, o Vite recarrega sozinho. Ao final, rode os verificadores — eles conferem se está tudo certo antes de você entregar:

```bash
# a partir de frontend/
bunx tsc -b --noEmit   # checa tipos do TypeScript
# a partir de backend/
backend/.venv/bin/python -m pytest
```

---

## As camadas e a ordem de implementação

O backend é organizado em **camadas**, uma em cima da outra: **Routes → DTOs → Repos → SQL → DB**. Pense numa pilha: a rota (Routes) recebe o pedido do navegador, os DTOs conferem o formato dos dados, os Repos sabem mexer no banco, o SQL são os comandos de banco, e o DB é o banco em si. O frontend segue o mesmo combinado (o "contrato") da API: **Response DTO ↔ `types.ts` ↔ `schemas.ts` ↔ páginas**.

Vamos construir **de baixo para cima**. Por quê? Porque cada camada usa a de baixo. Se você começasse pela tela, ela chamaria uma rota que ainda não existe; a rota chamaria um repo que ainda não existe; o repo usaria um SQL que ainda não existe — e nada rodaria. Construindo de baixo para cima, **cada passo só usa coisas que já estão prontas**, e você consegue testar pedaço por pedaço, sem ficar perdido.

Ordem completa:

1. **SQL** — `backend/sql/caracteristica_sql.py` (CREATE das duas tabelas + queries).
2. **Model** — `backend/model/caracteristica_model.py` (dataclass).
3. **Repo** — `backend/repo/caracteristica_repo.py` (`criar_tabela`, CRUD, `vincular`/`desvincular`/`listar_por_imovel`).
4. **DTO + Response** — `backend/dtos/caracteristica_dto.py` e `backend/dtos/responses/caracteristica_response.py`; e incluir a lista de características nas responses de imóvel.
5. **Rota admin** — `backend/routes/admin_caracteristicas_routes.py`.
6. **Ajuste em `imoveis_routes.py`** — aceitar e retornar os vínculos.
7. **Registrar no startup** — `backend/main.py` (tabela + router). ⚠️ Passo que mais se erra.
8. **Frontend infra** — `types.ts`, `schemas.ts` (e usar o `api.ts` que já existe).
9. **UI** — página admin, checkboxes no `ImovelFormPage`, tags no `PropertyDetailPage`.
10. **Registrar rota/menu no front** — `router.tsx` + item no `AdminLayout`.

---

## Passo 1 — SQL das tabelas e queries

### Arquivo: `backend/sql/caracteristica_sql.py` — **ARQUIVO NOVO**

Aqui ficam só os comandos de SQL escritos como texto (SQL puro, sem nenhuma biblioteca que esconda o banco — sem "ORM"), no mesmo estilo de `backend/sql/imovel_sql.py`. São duas tabelas: `caracteristica` (o catálogo de comodidades) e `imovel_caracteristica` (a tabela de junção que liga os dois lados da relação N:N). A tabela de junção usa uma **chave primária composta** `(imovel_id, caracteristica_id)` — ou seja, é o par dos dois IDs juntos que precisa ser único — e isso impede que o mesmo vínculo seja gravado duas vezes. Ela também tem duas chaves estrangeiras (as **FKs**, que apontam para outra tabela) com `ON DELETE CASCADE`: se o imóvel ou a característica for apagado, o vínculo some junto, automaticamente.

```python
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
```

Pontos importantes:

- `nome TEXT NOT NULL UNIQUE`: duas comodidades não podem ter o mesmo nome.
- `icone TEXT`: opcional (um glyph/emoji, ex.: `🏊`). Pode deixar vazio.
- `INSERT OR IGNORE`: se o vínculo já existir, o SQLite simplesmente ignora em vez de dar erro.
- `LISTAR_POR_IMOVEL` faz `INNER JOIN` para ir do `imovel_id` até os dados completos da característica.

---

## Passo 2 — Model (entidade de domínio)

### Arquivo: `backend/model/caracteristica_model.py` — **ARQUIVO NOVO**

No projeto, cada entidade (cada "coisa" do sistema) é uma `@dataclass` do Python — uma classe simples, feita só para guardar campos, em vez de um dicionário (`dict`) solto. Copie o estilo de `backend/model/foto_imovel_model.py`. Esta entidade não tem campos de lista fixa (enums).

```python
"""Modelo de domínio da Característica/Comodidade do imóvel."""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Caracteristica:
    """Comodidade que pode ser vinculada a vários imóveis (relação N:N)."""

    id: int
    nome: str
    icone: Optional[str] = None
    data_cadastro: Optional[datetime] = None
    data_atualizacao: Optional[datetime] = None
```

- `id`, `nome` são obrigatórios; `icone` e as datas são opcionais (vêm com `= None`).
- Campos opcionais **sempre** ficam **depois** dos obrigatórios numa dataclass.

---

## Passo 3 — Repositório (Repo)

### Arquivo: `backend/repo/caracteristica_repo.py` — **ARQUIVO NOVO**

Esta é a camada que conversa com o banco de dados. Copie fielmente o estilo de `backend/repo/imovel_repo.py` e `backend/repo/foto_imovel_repo.py`:

- Conexão sempre via `with obter_conexao() as conn:` — esse `with` garante que, ao terminar, a gravação seja confirmada (commit) ou desfeita se der erro (rollback), e já liga a checagem das FKs.
- SQL sempre com *prepared statement* (aqueles `?` no lugar dos valores), nunca montando a string na mão com os dados do usuário — isso evita uma falha de segurança chamada injeção de SQL.
- Datas de gravação sempre via `agora()` (NUNCA `datetime.now()` nem `.strftime()`), para todo o projeto gravar a data do mesmo jeito.
- Uma função privada `_row_to_caracteristica` converte a linha do banco em entidade.
- `criar_tabela()` cria as **duas** tabelas (catálogo + junção), nessa ordem.

```python
"""
Repositório de Características/Comodidades (tabela ``caracteristica`` + junção
N:N ``imovel_caracteristica`` com ``imovel``).

Camada Repos da arquitetura Routes -> DTOs -> Repos -> SQL -> DB. SQL puro com
prepared statements, sem ORM. Datas de gravação usam ``agora()``.
"""
import sqlite3
from typing import Optional

from model.caracteristica_model import Caracteristica
from sql.caracteristica_sql import (
    CRIAR_TABELA_CARACTERISTICA,
    CRIAR_TABELA_IMOVEL_CARACTERISTICA,
    INSERIR,
    ATUALIZAR,
    OBTER_POR_ID,
    OBTER_POR_NOME,
    OBTER_TODOS,
    EXCLUIR,
    VINCULAR,
    DESVINCULAR,
    DESVINCULAR_TODAS_DO_IMOVEL,
    LISTAR_POR_IMOVEL,
)
from util.db_util import obter_conexao
from util.datetime_util import agora


# ===================== HELPERS =====================


def _row_to_caracteristica(row: sqlite3.Row) -> Caracteristica:
    return Caracteristica(
        id=row["id"],
        nome=row["nome"],
        icone=row["icone"],
        data_cadastro=row["data_cadastro"],
        data_atualizacao=row["data_atualizacao"],
    )


# ===================== TABELAS =====================


def criar_tabela() -> bool:
    """Cria a tabela do catálogo e a tabela de junção (nessa ordem)."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA_CARACTERISTICA)
        cursor.execute(CRIAR_TABELA_IMOVEL_CARACTERISTICA)
        return True


# ===================== CRUD CARACTERÍSTICA =====================


def inserir(caracteristica: Caracteristica) -> Optional[int]:
    momento = agora()
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(
            INSERIR,
            (
                caracteristica.nome,
                caracteristica.icone,
                momento,
                momento,
            ),
        )
        return cursor.lastrowid


def atualizar(caracteristica: Caracteristica) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(
            ATUALIZAR,
            (
                caracteristica.nome,
                caracteristica.icone,
                agora(),
                caracteristica.id,
            ),
        )
        return cursor.rowcount > 0


def obter_por_id(id: int) -> Optional[Caracteristica]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_ID, (id,))
        row = cursor.fetchone()
        return _row_to_caracteristica(row) if row else None


def obter_por_nome(nome: str) -> Optional[Caracteristica]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_NOME, (nome,))
        row = cursor.fetchone()
        return _row_to_caracteristica(row) if row else None


def obter_todos() -> list[Caracteristica]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_TODOS)
        return [_row_to_caracteristica(row) for row in cursor.fetchall()]


def excluir(id: int) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(EXCLUIR, (id,))
        return cursor.rowcount > 0


# ===================== JUNÇÃO N:N =====================


def vincular(imovel_id: int, caracteristica_id: int) -> bool:
    """Cria o vínculo imóvel <-> característica (ignora se já existir)."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(VINCULAR, (imovel_id, caracteristica_id))
        return cursor.rowcount > 0


def desvincular(imovel_id: int, caracteristica_id: int) -> bool:
    """Remove um vínculo específico imóvel <-> característica."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(DESVINCULAR, (imovel_id, caracteristica_id))
        return cursor.rowcount > 0


def definir_do_imovel(imovel_id: int, ids_caracteristicas: list[int]) -> None:
    """Regrava o conjunto de características de um imóvel.

    Apaga todos os vínculos atuais e recria os informados. Usado pela rota de
    salvar imóvel (a UI manda a lista completa de marcados).
    """
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(DESVINCULAR_TODAS_DO_IMOVEL, (imovel_id,))
        for cid in ids_caracteristicas:
            cursor.execute(VINCULAR, (imovel_id, cid))


def listar_por_imovel(imovel_id: int) -> list[Caracteristica]:
    """Lista as características vinculadas a um imóvel (via JOIN)."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(LISTAR_POR_IMOVEL, (imovel_id,))
        return [_row_to_caracteristica(row) for row in cursor.fetchall()]
```

Pontos importantes:

- `definir_do_imovel`: o jeito mais simples de salvar N:N de um formulário. A tela manda a **lista completa** dos IDs marcados. A função apaga tudo e recria. Sem precisar calcular "o que entrou e o que saiu".
- Tudo dentro de **um único** `with obter_conexao()`: ou grava tudo, ou nada (transação).
- `vincular` retorna `True` só quando realmente inseriu (graças ao `OR IGNORE` + `rowcount`).

---

## Passo 4 — DTO de entrada e Responses

### Arquivo: `backend/dtos/caracteristica_dto.py` — **ARQUIVO NOVO**

O DTO de entrada confere se o que chega do navegador está no formato certo (lembra: DTO é o molde dos dados). Use as funções prontas de validação de `backend/dtos/validators.py`, exatamente como `backend/dtos/imovel_dto.py` faz. Quando um dado está errado, o validador dispara um `ValueError`, e o FastAPI transforma isso sozinho num erro **422** (o código que significa "você me mandou dados inválidos").

```python
"""
DTOs de entrada (criação/edição) do módulo Característica/Comodidade.

Validação via Pydantic + validators reutilizáveis de ``dtos/validators.py``.
"""
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from dtos.validators import (
    validar_string_obrigatoria,
    validar_comprimento,
)


class _CaracteristicaBaseDTO(BaseModel):
    """Campos comuns de criação e edição de característica."""

    nome: str = Field(..., description="Nome da comodidade (ex: Piscina)")
    icone: Optional[str] = Field(default=None, description="Ícone/emoji opcional")

    _validar_nome = field_validator("nome")(
        validar_string_obrigatoria(
            nome_campo="Nome", tamanho_minimo=2, tamanho_maximo=60
        )
    )
    _validar_icone = field_validator("icone")(validar_comprimento(tamanho_maximo=20))


class CriarCaracteristicaDTO(_CaracteristicaBaseDTO):
    """DTO de criação de característica."""


class AtualizarCaracteristicaDTO(_CaracteristicaBaseDTO):
    """DTO de edição de característica."""
```

### Arquivo: `backend/dtos/responses/caracteristica_response.py` — **ARQUIVO NOVO**

A Response é o molde do que a API devolve para o navegador (o caminho de volta). Ela tem um método construtor `de_caracteristica`, que recebe a entidade e monta a resposta — do mesmo jeito que `de_imovel`/`de_endereco` fazem em `backend/dtos/responses/imovel_response.py`.

```python
"""
Schema de resposta do módulo Característica/Comodidade.

Tipo espelhado em ``frontend/src/lib/types.ts`` (interface Caracteristica).
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from model.caracteristica_model import Caracteristica


class CaracteristicaResponse(BaseModel):
    """Comodidade do catálogo."""

    id: int
    nome: str
    icone: Optional[str] = None
    data_cadastro: Optional[datetime] = None
    data_atualizacao: Optional[datetime] = None

    @classmethod
    def de_caracteristica(cls, c: Caracteristica) -> "CaracteristicaResponse":
        return cls(
            id=c.id,
            nome=c.nome,
            icone=c.icone,
            data_cadastro=c.data_cadastro,
            data_atualizacao=c.data_atualizacao,
        )
```

### Editar: `backend/dtos/responses/imovel_response.py` — **EDIÇÃO**

Precisamos que o detalhe do imóvel devolva a **lista de comodidades**. Faça três pequenas mudanças.

**(4.a)** No topo do arquivo, junto dos outros imports de model/response, adicione o import da response de característica. Procure este bloco de imports (linhas iniciais):

```python
from model.imovel_model import Imovel
from model.endereco_imovel_model import EnderecoImovel
from model.foto_imovel_model import FotoImovel
```

E adicione, logo abaixo:

```python
from dtos.responses.caracteristica_response import CaracteristicaResponse
```

**(4.b)** Dentro da classe `ImovelResponse`, procure o último campo, que é a lista de fotos:

```python
    endereco: Optional[EnderecoImovelResponse] = None
    fotos: list[FotoImovelResponse] = Field(default_factory=list)
```

Adicione **um campo novo logo abaixo de `fotos`**:

```python
    caracteristicas: list[CaracteristicaResponse] = Field(default_factory=list)
```

**(4.c)** Ainda em `ImovelResponse`, no método `de_imovel`, procure a última linha do `return cls(...)`, que monta as fotos:

```python
            fotos=[FotoImovelResponse.de_foto(f) for f in imovel.fotos],
        )
```

Troque por (acrescentando a linha das características):

```python
            fotos=[FotoImovelResponse.de_foto(f) for f in imovel.fotos],
            caracteristicas=[
                CaracteristicaResponse.de_caracteristica(c)
                for c in imovel.caracteristicas
            ],
        )
```

Para que `imovel.caracteristicas` exista, precisamos adicionar esse campo à entidade `Imovel`.

### Editar: `backend/model/imovel_model.py` — **EDIÇÃO**

**(4.d)** No topo, junto dos outros imports de model, procure:

```python
from model.endereco_imovel_model import EnderecoImovel
from model.foto_imovel_model import FotoImovel
```

Adicione abaixo:

```python
from model.caracteristica_model import Caracteristica
```

**(4.e)** No final da dataclass `Imovel`, procure os agregados:

```python
    # Agregados (carregados sob demanda)
    endereco: Optional[EnderecoImovel] = None
    fotos: list[FotoImovel] = field(default_factory=list)
```

Adicione a linha de características:

```python
    # Agregados (carregados sob demanda)
    endereco: Optional[EnderecoImovel] = None
    fotos: list[FotoImovel] = field(default_factory=list)
    caracteristicas: list[Caracteristica] = field(default_factory=list)
```

### Editar: `backend/repo/imovel_repo.py` — **EDIÇÃO**

Precisamos que `obter_detalhe` carregue também as características. Como a entidade `Imovel` já tem o campo, basta preenchê-lo.

**(4.f)** No topo do `imovel_repo.py`, procure o import do repo de fotos:

```python
from repo import foto_imovel_repo
```

Troque por:

```python
from repo import foto_imovel_repo, caracteristica_repo
```

**(4.g)** Na função `obter_detalhe`, procure o final, onde as fotos são carregadas:

```python
    imovel.fotos = foto_imovel_repo.obter_por_imovel(id)
    return imovel
```

Troque por:

```python
    imovel.fotos = foto_imovel_repo.obter_por_imovel(id)
    imovel.caracteristicas = caracteristica_repo.listar_por_imovel(id)
    return imovel
```

Agora todo lugar que chama `obter_detalhe` (criar, editar, ver imóvel) já vem com as comodidades carregadas.

---

## Passo 5 — Rota CRUD admin

### Arquivo: `backend/routes/admin_caracteristicas_routes.py` — **ARQUIVO NOVO**

Copie o estilo de `backend/routes/admin_corretores_routes.py`. Alguns detalhes: o `APIRouter(prefix=...)` vai **sem** o `/api` (esse pedaço o `main.py` coloca depois); cada função que atende a um pedido é `async` e recebe `request: Request`; os erros são lançados com `HTTPException` e mensagem em português; e as ações que alteram dados têm um *rate limit* (um freio que limita quantos pedidos a pessoa pode fazer num intervalo, para evitar abuso).

Sobre quem pode fazer o quê: as ações que **mudam** dados (POST para criar, PUT para editar, DELETE para excluir) usam `@requer_autenticacao([Perfil.ADMIN.value])`, ou seja, só o administrador. Já a **leitura** (GET, que só lista) usa `@requer_autenticacao([Perfil.ADMIN.value, Perfil.CORRETOR.value])`, liberando também o corretor. Por quê? Porque o formulário de imóvel do corretor precisa buscar o catálogo de comodidades para mostrar os checkboxes — o catálogo é compartilhado e só listar não faz mal nenhum.

```python
"""
Rotas administrativas do CRUD de Características/Comodidades (API JSON).

Permite ao administrador listar, criar, editar e excluir comodidades que os
corretores marcam nos imóveis (relação N:N). Mutações restritas ao perfil
Administrador; a listagem (GET) também é liberada ao Corretor, pois o
formulário de imóvel precisa do catálogo para exibir os checkboxes.

Camada Routes da arquitetura Routes -> DTOs -> Repos -> SQL -> DB.
"""
from typing import Optional

from fastapi import APIRouter, HTTPException, Request, Response, status

from dtos.caracteristica_dto import (
    CriarCaracteristicaDTO,
    AtualizarCaracteristicaDTO,
)
from dtos.responses.caracteristica_response import CaracteristicaResponse

from model.caracteristica_model import Caracteristica
from model.usuario_logado_model import UsuarioLogado

from repo import caracteristica_repo

from util.api_helpers import checar_rate_limit
from util.auth_decorator import requer_autenticacao
from util.logger_config import logger
from util.perfis import Perfil
from util.rate_limiter import DynamicRateLimiter

# =============================================================================
# Configuração do Router
# =============================================================================

router = APIRouter(prefix="/admin/caracteristicas")

# =============================================================================
# Rate Limiters
# =============================================================================

caracteristica_limiter = DynamicRateLimiter(
    chave_max="rate_limit_caracteristica_max",
    chave_minutos="rate_limit_caracteristica_minutos",
    padrao_max=30,
    padrao_minutos=10,
    nome="caracteristica",
)


# =============================================================================
# Helpers
# =============================================================================

def _obter_ou_404(id: int) -> Caracteristica:
    """Carrega a característica pelo ID ou lança 404."""
    c = caracteristica_repo.obter_por_id(id)
    if not c:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comodidade não encontrada.",
        )
    return c


# =============================================================================
# Listagem
# =============================================================================

@router.get("", response_model=list[CaracteristicaResponse])
@requer_autenticacao([Perfil.ADMIN.value, Perfil.CORRETOR.value])
async def listar(
    request: Request,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Lista todas as comodidades cadastradas (ordenadas por nome).

    Leitura liberada para Administrador e Corretor: o catálogo de comodidades é
    compartilhado e o formulário de imóvel do corretor precisa carregá-lo para
    exibir os checkboxes. A criação/edição/exclusão permanece restrita ao Admin.
    """
    assert usuario_logado is not None
    todas = caracteristica_repo.obter_todos()
    return [CaracteristicaResponse.de_caracteristica(c) for c in todas]


# =============================================================================
# Criação
# =============================================================================

@router.post("", response_model=CaracteristicaResponse, status_code=status.HTTP_201_CREATED)
@requer_autenticacao([Perfil.ADMIN.value])
async def criar(
    request: Request,
    dto: CriarCaracteristicaDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Cria uma comodidade nova (nome único)."""
    assert usuario_logado is not None
    checar_rate_limit(caracteristica_limiter, request)

    if caracteristica_repo.obter_por_nome(dto.nome):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe uma comodidade com esse nome.",
        )

    nova = Caracteristica(id=0, nome=dto.nome, icone=dto.icone)
    novo_id = caracteristica_repo.inserir(nova)
    if not novo_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao cadastrar a comodidade. Tente novamente.",
        )

    logger.info(f"Comodidade #{novo_id} '{dto.nome}' criada por admin {usuario_logado.id}")
    return CaracteristicaResponse.de_caracteristica(caracteristica_repo.obter_por_id(novo_id))


# =============================================================================
# Atualização
# =============================================================================

@router.put("/{id}", response_model=CaracteristicaResponse)
@requer_autenticacao([Perfil.ADMIN.value])
async def atualizar(
    request: Request,
    id: int,
    dto: AtualizarCaracteristicaDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Edita o nome/ícone de uma comodidade."""
    assert usuario_logado is not None
    _obter_ou_404(id)

    existente = caracteristica_repo.obter_por_nome(dto.nome)
    if existente and existente.id != id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe outra comodidade com esse nome.",
        )

    atualizada = Caracteristica(id=id, nome=dto.nome, icone=dto.icone)
    if not caracteristica_repo.atualizar(atualizada):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar a comodidade. Tente novamente.",
        )

    logger.info(f"Comodidade #{id} atualizada por admin {usuario_logado.id}")
    return CaracteristicaResponse.de_caracteristica(caracteristica_repo.obter_por_id(id))


# =============================================================================
# Exclusão
# =============================================================================

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
@requer_autenticacao([Perfil.ADMIN.value])
async def excluir(
    request: Request,
    id: int,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Exclui uma comodidade (os vínculos caem por ON DELETE CASCADE)."""
    assert usuario_logado is not None
    _obter_ou_404(id)

    caracteristica_repo.excluir(id)
    logger.info(f"Comodidade #{id} excluída por admin {usuario_logado.id}")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
```

Pontos importantes:

- O `usuario_logado` aparece na assinatura como `Optional[...] = None` porque quem preenche ele é o **decorator** `@requer_autenticacao` (aquele `@` em cima da função, que "embrulha" a função e roda antes dela). Ou seja, o usuário logado não vem no corpo do pedido; o decorator descobre quem está logado e entrega. O `assert usuario_logado is not None` no começo serve só para o verificador de tipos não reclamar.
- O endpoint de listar devolve uma **lista simples**, sem paginação (sem quebrar em páginas) — o catálogo de comodidades costuma ser pequeno e cabe tudo de uma vez. Por isso `response_model=list[CaracteristicaResponse]`.
- Status HTTP: POST → 201, PUT → 200, DELETE → 204 (`Response(status_code=204)`), conflito de nome → 409.

Mais à frente, quando a tela de administração estiver pronta (Passos 9 e 10), essa rota vai alimentar uma página parecida com esta, onde o admin cadastra, edita e remove comodidades:

![Tela de administração do CRUD de comodidades, com formulário e lista](img/aluno1/crud-admin-comodidades.png)

---

## Passo 6 — Ajustar `imoveis_routes.py` para salvar/retornar vínculos

O corretor marca as comodidades **dentro do próprio formulário do imóvel** (não numa tela separada). Então o DTO de imóvel precisa aceitar a lista de IDs das comodidades marcadas, e as rotas de criar/editar precisam gravar esses vínculos.

### Editar: `backend/dtos/imovel_dto.py` — **EDIÇÃO**

**(6.a)** Em `_ImovelBaseDTO`, procure o campo `endereco` (é o último campo da classe base):

```python
    endereco: Optional[EnderecoImovelDTO] = Field(
        default=None, description="Endereço do imóvel (1:1, opcional)"
    )
```

Adicione **logo abaixo** um campo novo para a lista de IDs de comodidades:

```python
    endereco: Optional[EnderecoImovelDTO] = Field(
        default=None, description="Endereço do imóvel (1:1, opcional)"
    )
    caracteristica_ids: list[int] = Field(
        default_factory=list,
        description="IDs das comodidades vinculadas (N:N)",
    )
```

Com `default_factory=list`, se a tela não mandar nada, chega uma lista vazia (nenhuma comodidade) — e isso é totalmente válido. Não precisa de validação extra: cada ID é um número inteiro (`int`), e se vier um ID que não existe, o `OR IGNORE` da tabela de junção simplesmente ignora, sem dar erro.

### Editar: `backend/routes/imoveis_routes.py` — **EDIÇÃO**

**(6.b)** No topo, procure o import dos repos:

```python
from repo import conta_site_repo, foto_imovel_repo, imovel_repo
```

Troque por:

```python
from repo import caracteristica_repo, conta_site_repo, foto_imovel_repo, imovel_repo
```

**(6.c)** Na função `criar`, procure o trecho onde o imóvel é inserido e o detalhe é retornado:

```python
    novo_id = imovel_repo.inserir(imovel)
    if not novo_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao cadastrar o imóvel. Tente novamente.",
        )

    logger.info(
        f"Imóvel #{novo_id} '{dto.titulo}' criado na conta {conta.id} "
        f"por usuário {usuario_logado.id}"
    )

    criado = imovel_repo.obter_detalhe(novo_id)
    return ImovelResponse.de_imovel(criado)
```

Adicione a gravação dos vínculos **logo após o `if not novo_id:`** (e antes do `logger.info`):

```python
    novo_id = imovel_repo.inserir(imovel)
    if not novo_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao cadastrar o imóvel. Tente novamente.",
        )

    # Grava os vínculos N:N com as comodidades marcadas no formulário.
    caracteristica_repo.definir_do_imovel(novo_id, dto.caracteristica_ids)

    logger.info(
        f"Imóvel #{novo_id} '{dto.titulo}' criado na conta {conta.id} "
        f"por usuário {usuario_logado.id}"
    )

    criado = imovel_repo.obter_detalhe(novo_id)
    return ImovelResponse.de_imovel(criado)
```

**(6.d)** Na função `atualizar`, procure onde o imóvel é atualizado:

```python
    imovel_repo.atualizar(atualizado)

    logger.info(f"Imóvel #{id} atualizado por usuário {usuario_logado.id}")

    detalhe = imovel_repo.obter_detalhe(id)
    return ImovelResponse.de_imovel(detalhe)
```

Troque por (adicionando a regravação dos vínculos):

```python
    imovel_repo.atualizar(atualizado)

    # Regrava o conjunto de comodidades (a UI manda a lista completa marcada).
    caracteristica_repo.definir_do_imovel(id, dto.caracteristica_ids)

    logger.info(f"Imóvel #{id} atualizado por usuário {usuario_logado.id}")

    detalhe = imovel_repo.obter_detalhe(id)
    return ImovelResponse.de_imovel(detalhe)
```

> Como `obter_detalhe` agora carrega `caracteristicas` (passo 4.g) e `ImovelResponse` agora serializa esse campo (passo 4.c), o detalhe já volta com as comodidades — tanto no painel do corretor quanto na resposta da criação/edição.

---

## Passo 7 — Registrar a tabela e o router no startup ⚠️

**Este é o passo que mais gente esquece.** Se você pular ele, a tabela nunca é criada e a rota nunca é ligada — e aí nada funciona, mesmo com todo o resto do código perfeito. Vale a pena caprichar aqui.

Tudo acontece no arquivo **`backend/main.py`**. São quatro pequenas edições.

### Editar: `backend/main.py` — **EDIÇÃO**

**(7.a)** Procure o bloco que importa os repos do módulo de imóveis:

```python
from repo import conta_site_repo, imovel_repo, foto_imovel_repo
```

Troque por (acrescentando `caracteristica_repo`):

```python
from repo import conta_site_repo, imovel_repo, foto_imovel_repo, caracteristica_repo
```

**(7.b)** Procure o bloco que importa os routers:

```python
from routes.admin_corretores_routes import router as admin_corretores_router
from routes.conta_site_routes import router as conta_site_router
from routes.imoveis_routes import router as imoveis_router
```

Adicione abaixo:

```python
from routes.admin_caracteristicas_routes import router as admin_caracteristicas_router
```

**(7.c)** Procure a lista `TABELAS`:

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

Adicione a entrada de característica **depois** da de imóvel (porque a tabela de junção tem FK para `imovel`, então a tabela `imovel` precisa existir antes):

```python
TABELAS = [
    (usuario_repo, "usuario"),
    (conta_site_repo, "conta_site"),
    # imovel_repo.criar_tabela cria as três tabelas do módulo na ordem correta
    # de dependência: imovel -> endereco_imovel (1:1) -> foto_imovel (1:N).
    (imovel_repo, "imovel + endereco_imovel + foto_imovel"),
    # caracteristica_repo.criar_tabela cria 'caracteristica' + a junção N:N
    # 'imovel_caracteristica' (FK -> imovel, por isso vem DEPOIS de imovel).
    (caracteristica_repo, "caracteristica + imovel_caracteristica"),
    (configuracao_repo, "configuracao"),
]
```

**(7.d)** Procure a lista `ROUTERS`:

```python
ROUTERS = [
    (auth_router, ["Autenticação"], "autenticação"),
    (usuario_router, ["Usuário"], "usuário"),
    (admin_corretores_router, ["Admin - Corretores"], "admin de corretores"),
    (conta_site_router, ["Conta Site (Corretor)"], "conta/site do corretor"),
    (imoveis_router, ["Imóveis (Corretor)"], "imóveis do corretor"),
    (publico_router, ["Público"], "público (catálogo)"),
]
```

Adicione a entrada do router de características:

```python
ROUTERS = [
    (auth_router, ["Autenticação"], "autenticação"),
    (usuario_router, ["Usuário"], "usuário"),
    (admin_corretores_router, ["Admin - Corretores"], "admin de corretores"),
    (admin_caracteristicas_router, ["Admin - Comodidades"], "admin de comodidades"),
    (conta_site_router, ["Conta Site (Corretor)"], "conta/site do corretor"),
    (imoveis_router, ["Imóveis (Corretor)"], "imóveis do corretor"),
    (publico_router, ["Público"], "público (catálogo)"),
]
```

> Atenção à ordem na `TABELAS`: a tabela de junção referencia `imovel`, então `caracteristica_repo` precisa rodar **depois** de `imovel_repo`. Se inverter, o `CREATE TABLE` da junção pode falhar ao validar a FK.

Pare o backend (`Ctrl+C`) e suba de novo. Nos logs você deve ver `Tabela 'caracteristica + imovel_caracteristica' criada/verificada` e `Router de admin de comodidades incluído em /api`.

---

## Passo 8 — Frontend: tipos e schema

O combinado de dados (o "contrato") precisa bater **exatamente** entre backend e frontend: o que a API manda tem que ter o mesmo formato que o frontend espera receber. O código central que faz os pedidos para a API (`frontend/src/lib/api.ts`) já existe e cuida sozinho dos cookies e da proteção contra CSRF (um tipo de ataque que finge ser você num pedido) — **não mexa nele**, apenas use.

### Editar: `frontend/src/lib/types.ts` — **EDIÇÃO**

**(8.a)** Procure a seção de Imóvel (interface `EnderecoImovel`/`FotoImovel`). Logo **antes** da `interface Imovel`, adicione a interface da característica (espelha `CaracteristicaResponse`):

```ts
// Espelha backend/dtos/responses/caracteristica_response.py.
export interface Caracteristica {
  id: number
  nome: string
  icone?: string | null
  data_cadastro?: string | null
  data_atualizacao?: string | null
}
```

**(8.b)** Ainda em `types.ts`, na `interface Imovel`, procure o final:

```ts
  endereco?: EnderecoImovel | null
  fotos: FotoImovel[]
}
```

Adicione a lista de características:

```ts
  endereco?: EnderecoImovel | null
  fotos: FotoImovel[]
  caracteristicas: Caracteristica[]
}
```

### Editar: `frontend/src/lib/schemas.ts` — **EDIÇÃO**

**(8.c)** No `imovelSchema`, procure o campo `endereco` (último do objeto):

```ts
  endereco: enderecoImovelSchema.optional(),
})
export type ImovelForm = z.infer<typeof imovelSchema>
```

Adicione o campo de IDs de comodidades:

```ts
  endereco: enderecoImovelSchema.optional(),
  caracteristica_ids: z.array(z.coerce.number().int().positive()).default([]),
})
export type ImovelForm = z.infer<typeof imovelSchema>
```

`z.array(...).default([])`: aceita uma lista de números inteiros positivos; se não vier nada (`undefined`), vira lista vazia. Isso casa direitinho com o `caracteristica_ids: list[int] = Field(default_factory=list)` do backend — os dois lados combinam.

**(8.d)** Crie também um schema para o formulário admin de comodidade (use na página admin). No final do arquivo `schemas.ts`, adicione:

```ts
// ===== Característica/Comodidade (espelha _CaracteristicaBaseDTO) =====
export const caracteristicaSchema = z.object({
  nome: z
    .string()
    .min(2, 'O nome deve ter no mínimo 2 caracteres')
    .max(60, 'O nome deve ter no máximo 60 caracteres'),
  icone: z.string().max(20, 'O ícone deve ter no máximo 20 caracteres').optional(),
})
export type CaracteristicaForm = z.infer<typeof caracteristicaSchema>
```

> Você não precisa editar o `api.ts`: é só chamar `api.get/post/put/delete` direto nas páginas, como mostrado a seguir. Os caminhos já começam depois de `/api` (não escreva o `/api` de novo, o `api.ts` já põe).

---

## Passo 9 — UI: página admin, checkboxes e tags

### Arquivo: `frontend/src/pages/admin/AdminCaracteristicasPage.tsx` — **ARQUIVO NOVO**

Esta é a página de administração onde o admin faz o CRUD das comodidades (criar, listar, editar, excluir). Siga o estilo de `AdminCorretoresPage.tsx`: o componente é exportado como *default export* e tem o mesmo nome do arquivo; os estilos ficam escritos direto nos elementos (*inline styles*), usando as cores e fontes de `lib/theme.ts`; a leitura dos dados usa o hook `useFetch`; e o retorno para o usuário (mensagens de sucesso/erro e confirmação) vem do `toast` e do `pedirConfirmacao` — NUNCA use os `alert`/`confirm` nativos do navegador, que são feios e travam a tela. As chamadas à API passam pelo `api`.

```tsx
// Administração de comodidades (/admin/caracteristicas): lista + criar/editar/excluir.
// API: GET/POST /api/admin/caracteristicas, PUT/DELETE /api/admin/caracteristicas/{id}.
import { useState } from 'react'
import { api, ApiError } from '../../lib/api'
import type { Caracteristica } from '../../lib/types'
import { caracteristicaSchema } from '../../lib/schemas'
import { useFetch } from '../../hooks/useFetch'
import { toast, useUIStore } from '../../store/uiStore'
import { colors, fonts } from '../../lib/theme'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

export default function AdminCaracteristicasPage() {
  const pedirConfirmacao = useUIStore((s) => s.pedirConfirmacao)

  const { data, carregando, erro, recarregar } = useFetch<Caracteristica[]>(
    (signal) => api.get('/admin/caracteristicas', { signal }),
    [],
  )

  // Estado do formulário (criar ou editar).
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [nome, setNome] = useState('')
  const [icone, setIcone] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})

  function limparForm() {
    setEditandoId(null)
    setNome('')
    setIcone('')
    setErros({})
  }

  function editar(c: Caracteristica) {
    setEditandoId(c.id)
    setNome(c.nome)
    setIcone(c.icone ?? '')
    setErros({})
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    const payload = { nome: nome.trim(), icone: icone.trim() || undefined }
    const parsed = caracteristicaSchema.safeParse(payload)
    if (!parsed.success) {
      const novos: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const chave = String(issue.path[0] ?? '')
        if (chave && !novos[chave]) novos[chave] = issue.message
      }
      setErros(novos)
      toast.erro('Revise os campos destacados.')
      return
    }

    setSalvando(true)
    try {
      if (editandoId) {
        await api.put(`/admin/caracteristicas/${editandoId}`, parsed.data)
        toast.sucesso('Comodidade atualizada.')
      } else {
        await api.post('/admin/caracteristicas', parsed.data)
        toast.sucesso('Comodidade criada.')
      }
      limparForm()
      recarregar()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const novos: Record<string, string> = {}
          for (const [campo, msgs] of Object.entries(err.errors)) {
            if (msgs?.[0]) novos[campo] = msgs[0]
          }
          setErros(novos)
        }
        toast.erro(err.message)
      } else {
        toast.erro('Erro ao salvar a comodidade.')
      }
    } finally {
      setSalvando(false)
    }
  }

  function excluir(c: Caracteristica) {
    pedirConfirmacao({
      titulo: 'Excluir comodidade',
      mensagem: `Deseja excluir "${c.nome}"? Ela será removida de todos os imóveis.`,
      tipo: 'danger',
      textoConfirmar: 'Excluir',
      onConfirmar: async () => {
        try {
          await api.delete(`/admin/caracteristicas/${c.id}`)
          toast.sucesso('Comodidade excluída.')
          if (editandoId === c.id) limparForm()
          recarregar()
        } catch (err) {
          toast.erro(err instanceof ApiError ? err.message : 'Erro ao excluir a comodidade.')
        }
      },
    })
  }

  const itens = data ?? []

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    border: `1px solid ${colors.field}`,
    borderRadius: 10,
    fontSize: 15,
    background: '#fff',
    boxSizing: 'border-box' as const,
    fontFamily: fonts.body,
  }

  return (
    <div style={{ padding: '34px 44px', maxWidth: 820 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: fonts.display, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: '0 0 4px' }}>
          Comodidades
        </h1>
        <div style={{ fontSize: 14, color: colors.mutedSoft }}>
          Cadastre as comodidades que os corretores podem marcar nos imóveis.
        </div>
      </div>

      {/* Formulário criar/editar */}
      <form
        onSubmit={salvar}
        style={{
          background: '#fff',
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          padding: 24,
          marginBottom: 26,
          display: 'flex',
          gap: 14,
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.muted, marginBottom: 6 }}>
            Nome
          </label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Piscina"
            maxLength={60}
            style={{ ...inputStyle, borderColor: erros.nome ? '#e0a89e' : colors.field }}
          />
          {erros.nome && <div style={{ color: '#c0392b', fontSize: 12.5, marginTop: 5 }}>{erros.nome}</div>}
        </div>
        <div style={{ width: 120 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.muted, marginBottom: 6 }}>
            Ícone
          </label>
          <input
            value={icone}
            onChange={(e) => setIcone(e.target.value)}
            placeholder="🏊"
            maxLength={20}
            style={{ ...inputStyle, borderColor: erros.icone ? '#e0a89e' : colors.field }}
          />
        </div>
        <button
          type="submit"
          disabled={salvando}
          style={{
            padding: '12px 22px',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            color: '#fff',
            background: colors.orange,
            cursor: salvando ? 'wait' : 'pointer',
            fontFamily: fonts.body,
          }}
        >
          {salvando ? 'Salvando...' : editandoId ? 'Salvar' : 'Adicionar'}
        </button>
        {editandoId && (
          <button
            type="button"
            onClick={limparForm}
            style={{
              padding: '12px 18px',
              border: `1px solid ${colors.field}`,
              background: '#fff',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              color: colors.muted,
              cursor: 'pointer',
              fontFamily: fonts.body,
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      {/* Lista */}
      <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, overflow: 'hidden' }}>
        {carregando ? (
          <div style={{ padding: 32 }}>
            <Spinner />
          </div>
        ) : erro ? (
          <div style={{ padding: 24, color: colors.muted }}>{erro.message}</div>
        ) : itens.length === 0 ? (
          <div style={{ padding: 32 }}>
            <EmptyState
              icon="✦"
              titulo="Nenhuma comodidade"
              mensagem="Cadastre a primeira comodidade no formulário acima."
            />
          </div>
        ) : (
          itens.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 22px',
                borderBottom: '1px solid #f4f0e7',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{c.icone || '✦'}</span>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{c.nome}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => editar(c)}
                  style={{
                    padding: '8px 13px',
                    border: `1px solid ${colors.field}`,
                    background: '#fff',
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.muted,
                    cursor: 'pointer',
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => excluir(c)}
                  style={{
                    padding: '8px 13px',
                    border: 'none',
                    background: colors.bg,
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#c0392b',
                    cursor: 'pointer',
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

Repare que a tela já trata o caso de nome repetido: se o admin tentar cadastrar uma comodidade com um nome que já existe, o backend devolve o erro 409 e a página mostra um aviso (toast) explicando o problema, mais ou menos assim:

![Aviso (toast) na tela de comodidades quando o nome já existe](img/aluno1/toast-nome-duplicado.png)

### Editar: `frontend/src/pages/corretor/ImovelFormPage.tsx` — **EDIÇÃO**

Agora vamos adicionar o card de checkboxes no formulário do imóvel. São quatro pequenas mudanças.

**(9.a)** Nos imports do topo, procure:

```tsx
import { StatusImovel, TipoImovel, FinalidadeImovel } from '../../lib/types'
import type { Imovel } from '../../lib/types'
```

Troque por (importando o tipo `Caracteristica`):

```tsx
import { StatusImovel, TipoImovel, FinalidadeImovel } from '../../lib/types'
import type { Imovel, Caracteristica } from '../../lib/types'
```

**(9.b)** Dentro do componente `ImovelFormPage`, procure os `useState` do topo (logo depois de `const editando = Boolean(id)`):

```tsx
  const [campos, setCampos] = useState<CamposForm>(CAMPOS_VAZIOS)
  const [publicado, setPublicado] = useState(false)
  const [fotos, setFotos] = useState<Imovel['fotos']>([])
  const [codigo, setCodigo] = useState<string | null>(null)
```

Adicione dois estados: o catálogo de comodidades disponíveis e os IDs marcados:

```tsx
  const [campos, setCampos] = useState<CamposForm>(CAMPOS_VAZIOS)
  const [publicado, setPublicado] = useState(false)
  const [fotos, setFotos] = useState<Imovel['fotos']>([])
  const [codigo, setCodigo] = useState<string | null>(null)
  const [comodidades, setComodidades] = useState<Caracteristica[]>([])
  const [marcadas, setMarcadas] = useState<number[]>([])
```

**(9.c)** Carregue o catálogo de comodidades ao montar a página, e preencha os marcados ao editar. Logo **abaixo** do `useEffect` que carrega o imóvel (o que termina com `}, [editando, id, navigate])`), adicione um novo `useEffect`:

```tsx
  // Carrega o catálogo de comodidades disponíveis (uma vez).
  useEffect(() => {
    let ativo = true
    api
      .get<Caracteristica[]>('/admin/caracteristicas')
      .then((lista) => {
        if (ativo) setComodidades(lista)
      })
      .catch(() => {
        // Sem comodidades cadastradas ainda: segue sem o card.
      })
    return () => {
      ativo = false
    }
  }, [])
```

E, no `useEffect` que carrega o imóvel ao editar, procure o `.then((im) => { ... })`:

```tsx
      .then((im) => {
        if (!ativo) return
        setCampos(camposDeImovel(im))
        setPublicado(im.status_publicacao === StatusImovel.PUBLICADO)
        setFotos(im.fotos ?? [])
        setCodigo(im.codigo ?? null)
      })
```

Acrescente uma linha que marca as comodidades que já estão no imóvel:

```tsx
      .then((im) => {
        if (!ativo) return
        setCampos(camposDeImovel(im))
        setPublicado(im.status_publicacao === StatusImovel.PUBLICADO)
        setFotos(im.fotos ?? [])
        setCodigo(im.codigo ?? null)
        setMarcadas((im.caracteristicas ?? []).map((c) => c.id))
      })
```

> Observação: a rota `GET /api/admin/caracteristicas` libera leitura para **admin e corretor** (ver o decorator `@requer_autenticacao([Perfil.ADMIN.value, Perfil.CORRETOR.value])` na seção da rota). Assim o formulário do corretor consegue carregar o catálogo e exibir os checkboxes. O `.catch` acima continua útil como rede de segurança: se a listagem falhar por qualquer motivo (ex.: catálogo ainda vazio retornando lista vazia, ou erro de rede), o card simplesmente não aparece e o formulário segue funcionando. As **mutações** (criar/editar/excluir comodidade) permanecem restritas ao admin.

**(9.d)** Inclua os IDs marcados no payload enviado. Procure a função `montarPayload` no topo do arquivo. Ela recebe `(c, status)`. Vamos passar também os marcados. Primeiro, mude a **assinatura e o `return`** dela:

```tsx
function montarPayload(c: CamposForm, status: string): unknown {
```

para:

```tsx
function montarPayload(c: CamposForm, status: string, caracteristicaIds: number[]): unknown {
```

E no `return { ... }` dessa função, procure a última linha:

```tsx
    endereco: temEndereco ? endereco : undefined,
  }
```

Troque por:

```tsx
    endereco: temEndereco ? endereco : undefined,
    caracteristica_ids: caracteristicaIds,
  }
```

Agora, dentro de `salvar()`, procure a chamada que monta o payload:

```tsx
    const payload = montarPayload(campos, statusDesejado)
```

Troque por:

```tsx
    const payload = montarPayload(campos, statusDesejado, marcadas)
```

**(9.e)** Por fim, adicione o **card de checkboxes** na renderização. Um bom lugar é logo após o `Card title="Características"` (o de área/quartos/banheiros/vagas) e antes do `Card title="Endereço"`. Procure:

```tsx
      {/* Endereço */}
      <Card title="Endereço">
```

Insira **antes** desse comentário:

```tsx
      {/* Comodidades */}
      {comodidades.length > 0 && (
        <Card title="Comodidades" sub="Marque as comodidades que este imóvel oferece.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {comodidades.map((c) => {
              const ativa = marcadas.includes(c.id)
              return (
                <label
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    border: `1px solid ${ativa ? colors.orange : colors.field}`,
                    borderRadius: 10,
                    background: ativa ? '#fbeedd' : '#fff',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={ativa}
                    onChange={() =>
                      setMarcadas((atual) =>
                        atual.includes(c.id)
                          ? atual.filter((x) => x !== c.id)
                          : [...atual, c.id],
                      )
                    }
                  />
                  <span style={{ fontSize: 16 }}>{c.icone || '✦'}</span>
                  {c.nome}
                </label>
              )
            })}
          </div>
        </Card>
      )}

```

Com isso, o formulário do imóvel passa a mostrar o card de comodidades com os checkboxes:

![Card de comodidades com checkboxes no formulário do imóvel do corretor](img/aluno1/card-checkboxes-corretor.png)

E, ao marcar algumas, elas ficam destacadas (borda e fundo em laranja):

![Checkboxes de comodidades marcados, destacados em laranja](img/aluno1/checkboxes-marcados.png)

Pontos importantes:

- O estado `marcadas` é uma lista de IDs (`number[]`). Cada clique no checkbox adiciona ou remove o ID dessa lista.
- O `caracteristica_ids` que vai no envio é conferido pelo `imovelSchema` (passo 8.c) e chega no `dto.caracteristica_ids` do backend (passo 6.a).
- O card só aparece se houver comodidades cadastradas (`comodidades.length > 0`). Sem comodidades, ele nem é desenhado.

### Editar: `frontend/src/pages/catalogo/PropertyDetailPage.tsx` — **EDIÇÃO**

Por fim, vamos mostrar as comodidades como tags na página pública do imóvel (a que qualquer visitante vê). É o resultado final que apareceu lá no comecinho do tutorial.

**(9.f)** Procure o bloco "Sobre o imóvel" e os `StatBox` (área/quartos/etc.):

```tsx
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              <StatBox label="Área" value={formatarArea(im.area)} />
              <StatBox label="Quartos" value={im.quartos ?? 0} />
              <StatBox label="Banheiros" value={im.banheiros ?? 0} />
              <StatBox label="Vagas" value={im.vagas ?? 0} />
            </div>
          </div>
```

Insira, **logo após** o `</div>` que fecha o grid dos StatBox (e antes do `</div>` que fecha a seção "Sobre o imóvel"), um bloco de tags:

```tsx
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              <StatBox label="Área" value={formatarArea(im.area)} />
              <StatBox label="Quartos" value={im.quartos ?? 0} />
              <StatBox label="Banheiros" value={im.banheiros ?? 0} />
              <StatBox label="Vagas" value={im.vagas ?? 0} />
            </div>

            {im.caracteristicas && im.caracteristicas.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 24, margin: '0 0 14px' }}>
                  Comodidades
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {im.caracteristicas.map((c) => (
                    <span
                      key={c.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 7,
                        padding: '8px 14px',
                        borderRadius: 999,
                        background: '#fbeedd',
                        color: '#a85c1a',
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ fontSize: 15 }}>{c.icone || '✦'}</span>
                      {c.nome}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
```

> `im` aqui é o imóvel dentro de `ImovelPublicoDetalhe` (`const { imovel: im, catalogo } = data`). Como a `interface Imovel` agora tem `caracteristicas` (passo 8.b), o TypeScript já reconhece `im.caracteristicas`. As tags só aparecem se houver comodidades.

---

## Passo 10 — Registrar rota e menu no frontend

### Editar: `frontend/src/router.tsx` — **EDIÇÃO**

**(10.a)** Nos imports das páginas admin, procure:

```tsx
// Administração (/admin)
import AdminCorretoresPage from './pages/admin/AdminCorretoresPage'
```

Adicione abaixo:

```tsx
import AdminCaracteristicasPage from './pages/admin/AdminCaracteristicasPage'
```

**(10.b)** Procure o bloco de rotas da área admin:

```tsx
          {
            path: '/admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminCorretoresPage /> },
              { path: 'perfil', element: <EditPerfilPage /> },
            ],
          },
```

Adicione a rota das comodidades:

```tsx
          {
            path: '/admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminCorretoresPage /> },
              { path: 'caracteristicas', element: <AdminCaracteristicasPage /> },
              { path: 'perfil', element: <EditPerfilPage /> },
            ],
          },
```

A rota fica dentro de `AdminRoute` + `AdminLayout`, então só um admin logado consegue abrir essa tela.

### Editar: `frontend/src/components/layout/AdminLayout.tsx` — **EDIÇÃO**

**(10.c)** Adicione um item no menu lateral. Procure o `NavLink` de "Corretores":

```tsx
          <NavLink
            to="/admin"
            end
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 12px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              color: isActive ? colors.ink : '#cfc7b8',
              background: isActive ? colors.orange : 'transparent',
            })}
          >
            <span style={{ fontSize: 17 }}>☷</span> Corretores
          </NavLink>
```

Adicione **logo abaixo** dele um `NavLink` igual, apontando para a nova rota:

```tsx
          <NavLink
            to="/admin/caracteristicas"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 12px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              color: isActive ? colors.ink : '#cfc7b8',
              background: isActive ? colors.orange : 'transparent',
            })}
          >
            <span style={{ fontSize: 17 }}>✦</span> Comodidades
          </NavLink>
```

> Note que o item de Corretores usa `end` (porque a rota é `/admin` exata). O item de Comodidades **não** usa `end`, e está certo: ele casa em `/admin/caracteristicas`.

---

## Como testar

### 1. Backend

Pare e suba o backend a partir de `backend/`:

```bash
backend/.venv/bin/python main.py
```

Confira nos logs:
- `Tabela 'caracteristica + imovel_caracteristica' criada/verificada`
- `Router de admin de comodidades incluído em /api`

Abra `http://localhost:8411/docs` e confira que aparecem os endpoints sob **Admin - Comodidades**.

### 2. Frontend

A partir de `frontend/`:

```bash
bun run dev
```

E rode a checagem de tipos (não pode aparecer nenhum erro):

```bash
bunx tsc -b --noEmit
```

### 3. Fluxo na tela

1. Faça login como **admin** (`cavi@ifes.site`).
2. No menu lateral admin, clique em **Comodidades**. Cadastre algumas: *Piscina* (ícone `🏊`), *Churrasqueira* (`🔥`), *Academia* (`🏋`). Teste editar e excluir.
3. Faça logout e login como **corretor**. Vá em **Meus imóveis** → edite um imóvel. Você verá o card **Comodidades** com checkboxes. Marque algumas e clique em **Salvar imóvel**.
4. Publique o imóvel (toggle "Publicar imóvel no catálogo").
5. Abra o **catálogo público** do corretor (`/v/{slug}`) e clique no imóvel. Na seção **Comodidades** devem aparecer as tags marcadas.
6. Volte e desmarque uma comodidade, salve, e confira que ela some das tags. (Isso valida o `definir_do_imovel`, que regrava o conjunto.)

### 4. Teste automatizado simples (opcional)

O projeto usa pytest (`backend/`). Um teste de unidade do repo, no estilo dos testes existentes, poderia ser:

```python
# backend/tests/unit/test_caracteristica_repo.py
from model.caracteristica_model import Caracteristica
from repo import caracteristica_repo


def test_vincular_e_listar_por_imovel():
    caracteristica_repo.criar_tabela()
    cid = caracteristica_repo.inserir(Caracteristica(id=0, nome="Piscina"))
    # supõe que exista um imóvel de id=1 (use uma fixture/seed do projeto)
    caracteristica_repo.definir_do_imovel(1, [cid])
    nomes = [c.nome for c in caracteristica_repo.listar_por_imovel(1)]
    assert "Piscina" in nomes
```

Rode com:

```bash
backend/.venv/bin/python -m pytest backend/tests/unit/test_caracteristica_repo.py
```

> Ajuste o `imovel_id` para um imóvel que exista no seu banco de teste (siga o padrão de fixtures dos testes já presentes em `backend/tests/`).

---

## Erros comuns e como resolver

1. **A tabela nunca é criada / erro "no such table: caracteristica".**
   Você esqueceu de registrar `caracteristica_repo` na lista `TABELAS` em `backend/main.py` (passo 7.c), ou esqueceu de importá-lo (7.a). Confira os logs do startup.

2. **404 em `/api/admin/caracteristicas`.**
   Você não registrou o router na lista `ROUTERS` em `main.py` (passo 7.d) ou não importou (7.b). Lembre: o router é montado com `prefix="/admin/caracteristicas"` **sem** o `/api` — o `/api` é aplicado pelo `main.py`. No front, chame `/admin/caracteristicas` (sem `/api`, porque o `api.ts` já adiciona).

3. **As comodidades não salvam ao editar o imóvel.**
   Quase sempre é o contrato que não bate. Confira: o DTO tem `caracteristica_ids` (6.a), a rota chama `definir_do_imovel` (6.c/6.d), o `imovelSchema` tem `caracteristica_ids` (8.c) e o `montarPayload` inclui esse campo (9.d). Se faltar qualquer um, os IDs não chegam ao banco.

4. **As tags não aparecem no detalhe público.**
   Verifique se `obter_detalhe` carrega `caracteristicas` (4.g), se `ImovelResponse` serializa o campo (4.c) e se a `interface Imovel` do front tem `caracteristicas` (8.b). Se a response não traz o campo, o front não tem o que mostrar.

5. **Erro 403 / "Forbidden" ao salvar (CSRF).**
   Mutações (POST/PUT/DELETE) exigem o header `X-CSRF-Token`. Se você usar `api.post/put/delete`, isso é automático. **Não** use `fetch` cru para essas chamadas (a única exceção no projeto é upload multipart de foto, que já trata o CSRF com `garantirCsrf()`).

6. **`tsc` reclama de tipo em `im.caracteristicas` ou no checkbox.**
   Você não atualizou `types.ts`: a `interface Imovel` precisa ter `caracteristicas: Caracteristica[]` (8.b) e a interface `Caracteristica` precisa existir (8.a). Rode `bunx tsc -b --noEmit` para localizar.

7. **Erro 422 ao criar comodidade.**
   O nome tem menos de 2 ou mais de 60 caracteres (validator do DTO, passo 4). O contrato de erro `{detail, type, errors}` chega no `ApiError.errors` e a página mostra a mensagem por campo. Confira o `caracteristicaSchema` (8.d) batendo com o DTO.

---

## Checklist final

Marque cada item conforme concluir:

- [ ] **SQL** — `backend/sql/caracteristica_sql.py` criado (2 tabelas + queries CRUD/junção).
- [ ] **Model** — `backend/model/caracteristica_model.py` criado (dataclass).
- [ ] **Model imóvel** — campo `caracteristicas` adicionado em `Imovel` (`imovel_model.py`).
- [ ] **Repo** — `backend/repo/caracteristica_repo.py` com `criar_tabela`, CRUD, `vincular`, `desvincular`, `definir_do_imovel`, `listar_por_imovel`.
- [ ] **Repo imóvel** — `obter_detalhe` carrega `caracteristicas`.
- [ ] **DTO** — `backend/dtos/caracteristica_dto.py` (criar/editar) + `caracteristica_ids` no `imovel_dto.py`.
- [ ] **Response** — `caracteristica_response.py` criado + campo/serialização em `imovel_response.py`.
- [ ] **Rota admin** — `backend/routes/admin_caracteristicas_routes.py` (CRUD, só admin).
- [ ] **Rota imóvel** — `imoveis_routes.py` grava vínculos no criar e no atualizar.
- [ ] **Startup tabela** — `caracteristica_repo` importado e na lista `TABELAS` (após imóvel) em `main.py`.
- [ ] **Startup router** — `admin_caracteristicas_router` importado e na lista `ROUTERS` em `main.py`.
- [ ] **Tipos** — `Caracteristica` e `Imovel.caracteristicas` em `types.ts`.
- [ ] **Schema** — `caracteristica_ids` no `imovelSchema` + `caracteristicaSchema` em `schemas.ts`.
- [ ] **Página admin** — `AdminCaracteristicasPage.tsx` criada.
- [ ] **Checkboxes** — card de comodidades no `ImovelFormPage.tsx` + payload com `caracteristica_ids`.
- [ ] **Tags** — seção de comodidades no `PropertyDetailPage.tsx`.
- [ ] **Rota front** — `/admin/caracteristicas` em `router.tsx`.
- [ ] **Menu front** — item "Comodidades" no `AdminLayout.tsx`.
- [ ] **Verificação** — `bunx tsc -b --noEmit` passa e o fluxo na tela funciona ponta a ponta.
