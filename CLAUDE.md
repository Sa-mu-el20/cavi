# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

**CAVI** — SaaS imobiliário multi-tenant construído sobre um boilerplate educacional (projetos integradores) com **arquitetura SPLIT**: API REST JSON em FastAPI + SPA React, repos separados na mesma raiz.

Domínio: cada **corretor** assina um plano e ganha um **site/catálogo próprio** (`ContaSite` com slug, identidade visual, WhatsApp) onde publica **imóveis** (com endereço, fotos, finalidade venda/aluguel). Visitantes navegam catálogos públicos; clientes favoritam e solicitam anúncios. Ver `docs/CAVI.md` para o DER completo e o mapa de páginas.

- `backend/` — FastAPI (Python 3.11+, SQLite **sem ORM**, SQL puro com prepared statements). Serve **apenas JSON** sob `/api` + `static/`. Em produção também serve o `index.html` do SPA buildado.
- `frontend/` — SPA React 19 + React Router 7 + TypeScript + Zod + Zustand + Vite. UI **CSS custom** (estética CAVI; fontes Hanken Grotesk no corpo + Jost em títulos), **sem Bootstrap**. Estilos globais em `src/styles/custom.css` (porte de `design/cavi-react/`); tokens de cor/fonte em `src/lib/theme.ts` (aplicados via inline styles nos componentes).
- Deploy: **cavi.ifes.site**. Em dev, Vite faz proxy de `/api`, `/static`, `/health` → backend (same-origin, sem CORS).
- `design/` (mockups + protótipo React de referência `cavi-react/`), `docs/` (`CAVI.md`, `FORKING.md`), `logs/` são **apoio/referência** — não fazem parte do bundle do app.

> **Esquema de portas**: **8411** = porta do backend em TODA camada — dev local (default do backend, alvo do proxy Vite, default do `configurar_projeto.py`), interna do container (Uvicorn no Docker) e publicada no VPS (`deploy/docker-compose.yml` mapeia `8411:8411`). **5181** = Vite dev server (SPA). (O starter kit original usava 8400 dev / 8000 interna / 8410 publicada; o CAVI unificou tudo em 8411.)

## Comandos

### Backend (rodar a partir de `backend/`)
O `.python-version` aponta para 3.14 (não instalado) — **sempre** usar o interpretador do venv:

```bash
backend/.venv/bin/python main.py                    # sobe API (porta via .env PORT; default 8411)
backend/.venv/bin/python -m pytest                  # todos os testes
backend/.venv/bin/python -m pytest tests/unit       # só unitários
backend/.venv/bin/python -m pytest tests/integration/test_x.py::TestClasse::test_metodo  # um teste
backend/.venv/bin/python -m pytest -m "not slow"    # markers: slow, integration, unit, auth, crud
```
Docs interativas em `/docs`. `pytest.ini` usa `asyncio_mode=auto`. Scripts utilitários em `backend/scripts/` (`configurar_projeto.py` re-scaffolda enums/seed para um novo fork; `redefinir_senha.py`).

### Frontend (rodar a partir de `frontend/`)
```bash
npm run dev          # Vite dev server na porta 5181 (proxy /api -> VITE_BACKEND_URL, fallback 8411)
npm run build        # tsc -b && vite build  (saída em dist/, servida pelo backend em prod)
npm run test         # vitest run
npx tsc -b --noEmit  # typecheck isolado
npm run lint         # eslint
```

## Contrato de API — eixo central da conformidade backend↔frontend

Mudou algo de um lado, espelhe no outro. Os dois lados têm que bater **exato**.

- **Prefixo único `/api`**: backend monta todos os routers sob `API_PREFIX="/api"` (`backend/main.py`); frontend `src/lib/api.ts` usa `BASE='/api'`. Caminhos no front são **relativos a `/api`** (não incluir o prefixo).
- **Cliente HTTP central**: `frontend/src/lib/api.ts` — `credentials:'include'`, header `X-CSRF-Token` automático, classe `ApiError` (`.status`, `.type`, `.message`, `.errors`, `.retryAfter`). **Toda** chamada passa por aqui.
- **Contrato de erro**: `{detail, type, errors}` via handlers globais em `backend/util/exception_handlers.py`. Validação 422 → `util/validation_util.py:processar_erros_validacao_lista` chaveia erros por `loc[-1]` (último segmento; body aninhado vira chave simples). Traceback de dev fica fora do contrato.
- **Paginação**: envelope `PaginaResponse[T]` (`backend/dtos/responses/comum.py`: `items/pagina/por_pagina/total/total_paginas`) ↔ `PaginaResponse<T>` em `frontend/src/lib/types.ts`. Params `pagina`/`por_pagina`.
- **CSRF**: mutações enviam `X-CSRF-Token`; `GET /api/csrf-token` → `{token}`. Lista de paths isentos em `util/csrf_protection.py`.
- **Tipos espelhados**: Response DTOs em `backend/dtos/responses/*.py` ↔ tipos em `frontend/src/lib/types.ts` ↔ validação Zod em `frontend/src/lib/schemas.ts`.
- **Enums batem exato dos dois lados** (`util/perfis.py` + `model/*.py` ↔ `const` em `types.ts`):
  - **Perfil**: Administrador / Corretor.
  - **StatusImovel**: Publicado / Oculto. **FinalidadeImovel**: Venda / Aluguel.
  - **TipoImovel**: Apartamento / Casa / Studio / Cobertura / Loft / Sala comercial / Terreno.
  - **StatusConta**: Ativo / Inativo.
- **Upload de fotos de imóvel = multipart** (`UploadFile`/`Form` em `imoveis_routes.py`), não base64 — diferente da foto de perfil (base64).

## Arquitetura backend (`backend/`)

Camadas: **Routes → DTOs → Repos → SQL → DB**. `main.py` registra repos (criação de tabelas) e routers.

- **Auth**: decorator `@requer_autenticacao()` (`util/auth_decorator.py`) + dataclass `UsuarioLogado` (NUNCA dict). Sessão por cookie (`SessionMiddleware`, `SameSite=lax`).
- **Ordem dos middlewares importa** (último `add_middleware` é o mais externo): SegurançaHeaders (externo) → Session → CSRF. CSRF precisa de `request.session` já populado.
- **Perfis**: enum `Perfil` de `util/perfis.py` (fonte única; NUNCA strings literais). Enums de domínio herdam de `EnumEntidade` (`util/enum_base.py`).
- **DB datetime**: usar `agora()` de `util/datetime_util.py` ao salvar (NUNCA `.strftime()`).
- **Validação de form**: validators em `dtos/validators.py`; levantam `ValueError` → 422.
- **Rate limit**: `util/api_helpers.py:checar_rate_limit` (já emite header `Retry-After`), usado por todas as rotas.
- **Seed admin**: `backend/data/admin_seed.json` (perfil Administrador, `cavi@ifes.site`) — útil p/ testar páginas protegidas/admin.

## Arquitetura frontend (`frontend/src/`)

**Leia `frontend/CONVENTIONS.md` antes de editar páginas.** A infra (api, tipos, stores, componentes, layouts, router) já existe — em geral só se implementam páginas em `src/pages/**`; não recriar helpers.

- `lib/` — `api.ts` (cliente), `schemas.ts` (Zod), `types.ts` (tipos+enums const), `theme.ts` (tokens `colors` + `fonts.body`/`fonts.display`), `format.ts` (`formatarData/DataHora/Hora/Moeda/Bytes`, + CAVI: `formatarPrecoImovel`, `formatarArea`, `linkWhatsApp`, `urlMidia`), `masks.ts` (máscaras de input: `apenasDigitos`, `mascararCpf`, `mascararTelefone`, `mascararMoeda`, `formatarNumeroComoMoedaInput`, `moedaParaNumero`).
- `store/` — Zustand: `authStore` (sessão/usuário, `isAdmin()`), `uiStore` (toast/confirmação/alerta). Feedback **sempre** via `toast.sucesso/erro/aviso/info` ou `pedirConfirmacao`/`mostrarAlerta` — **NUNCA** `alert()/confirm()/prompt()` nativos.
- `hooks/useFetch.ts` — fetch com `{data, carregando, erro, recarregar}`.
- `router.tsx` — três áreas com layouts próprios: `SiteLayout` (público), `BrokerLayout` (corretor), `AdminLayout` (admin). Gates de roteamento em `components/routing/`: `RootGate` (carrega sessão via `/api/me`; 401 anônimo é esperado), `CorretorRoute`, `AdminRoute`, `RouteError`.
- `components/` — `cavi/` (estética: `PropertyCard`, `BrokerCard`, `PublicHeader`, `Avatar`, `Badge`, `StatCard`), `form/` (`Field`: TextField/TextAreaField/SelectField/SubmitButton), `ui/` (Pagination, EmptyState, Spinner, Toasts, ConfirmModal, AlertModal), `layout/`, `routing/`.
- `pages/` — `public/` (Home, Catalogos, Auth, NotFound), `catalogo/` (CatalogPage, PropertyDetailPage), `corretor/` (DashboardCorretor, ImoveisLista, ImovelForm, ConfigSite, EditPerfil), `admin/` (AdminCorretores), `auth/` (EsqueciSenha, RedefinirSenha).
- Alias `@` → `src/`.
- **Textareas controladas** NÃO populam via MCP `fill`/`fill_form`; usar setter nativo + dispatch de evento `input`.

## Módulos de domínio (rota backend ↔ página frontend)

CAVI (núcleo ativo):
- **auth**: login/logout/cadastrar (cliente e corretor)/esqueci-senha/redefinir-senha/me/csrf-token.
- **publico** (`/publico`): home (lista de corretores), catálogo público por slug (`/catalogo/{slug}`), detalhe de imóvel (`/imoveis/{id}`) — sem auth. DTOs em `dtos/responses/publico_response.py`.
- **imoveis** (`/imoveis`, corretor): CRUD de imóveis + upload de fotos (multipart). DTOs em `imovel_response.py`.
- **conta_site** (`/minha-conta`, corretor): configuração do site/catálogo do corretor (nome público, slug, WhatsApp, identidade visual). DTOs em `conta_site_response.py`.
- **admin/corretores**: gestão de corretores/contas pelo administrador.
- **usuario**: perfil (ver/editar/foto base64/senha). Foto de perfil: máx 10MB, valida tipo+tamanho no cliente.

> **Legado do starter kit REMOVIDO**: chamados, chat, pagamentos (Mercado Pago/Stripe/PayPal — gateway + adapters), notificações, backups, auditoria, e as telas admin de usuários/configurações foram eliminados do backend (routers, repos, models, DTOs, SQL, utils e testes). O que sobrou do starter kit é **infra core ainda usada**: `repo/configuracao_repo.py` + `util/migrar_config.py` (config híbrida `.env`→DB, categorizada por prefixo `[Categoria]`) e `repo/usuario_repo.py` (auth/perfil) — sem rota/página admin dedicada.

## Convenções de commit (do usuário)

- `git add` **SELETIVO**: só os arquivos que esta sessão alterou. NUNCA `git add -A/./-u`, `git commit -a/-am`. Rodar `git status --short` e cruzar com a lista de arquivos editados antes de commitar (há múltiplos agentes paralelos no mesmo repo).
- Pedir confirmação antes de push. PR só com permissão explícita por PR. Não se identificar como Claude nos commits.
