# Convenções do Frontend (LEIA ANTES DE EDITAR QUALQUER PÁGINA)

Stack: **React 19 + React Router 7 + Zod + Zustand + TypeScript + Vite**.
UI em **CSS custom (estética CAVI)** — **sem Bootstrap, sem framework de UI**.
Estilos globais em `src/styles/custom.css` (importado uma vez em `main.tsx`);
tokens de cor/fonte em `src/lib/theme.ts`, aplicados via **inline styles (CSS-in-JS)**
nos componentes. Fontes: **Hanken Grotesk** no corpo, **Jost** em títulos.

A infraestrutura (api, tipos, stores, componentes, layouts, router) **já existe**.
Você só implementa páginas em `src/pages/**`. **NÃO** edite o router, os layouts nem a
infra, salvo instrução explícita. Use SEMPRE o que já existe — não recrie helpers.

## Cliente HTTP — `src/lib/api.ts`

```ts
import { api, ApiError } from '@/lib/api' // (ou caminho relativo)
const perfil = await api.get<Usuario>('/usuario/perfil')
const imovel = await api.post<Imovel>('/imoveis', dados)
await api.put<Imovel>(`/imoveis/${id}`, dados)
await api.patch<ContaSiteResponse>(`/admin/corretores/${id}/status`, { status })
await api.delete(`/imoveis/${id}`)
```

- Caminhos são **relativos a `/api`** (não inclua o prefixo `/api`).
- `credentials: include` e header **`X-CSRF-Token`** são automáticos. Não se preocupe com CSRF.
- Query string: `api.get('/imoveis', { params: { pagina, q } })` (valores vazios omitidos).
- Erros lançam `ApiError` com `.status`, `.type`, `.message` (detail), `.errors` (por campo),
  `.retryAfter`. Para erro de validação (422): `err.errors?.campo?.[0]` ou `err.campo('campo')`.
- **Upload de fotos de imóvel = multipart** (`FormData`), não base64. Foto de perfil = base64.

## Tipos — `src/lib/types.ts`

Shapes de resposta espelhando `backend/dtos/responses/*.py`: `Usuario`, `ContaSite`,
`CorretorAdmin`, `ContaSiteResumo`, `Imovel`, `ImovelResumo`, `EnderecoImovel`,
`FotoImovel`, `CorretorCatalogo`, `CatalogoPublico`, `ImovelPublicoDetalhe`,
`PaginaResponse<T>`, `MensagemResponse`, `TokenCsrfResponse`. Enums como objetos const:
`Perfil`, `StatusImovel`, `FinalidadeImovel`, `TipoImovel`, `StatusConta`.
**Importe daqui**, não redefina.

## Estado global — `src/store/`

```ts
import { useAuthStore } from '@/store/authStore'
const usuario = useAuthStore((s) => s.usuario)        // Usuario | null
const isAdmin = useAuthStore((s) => s.isAdmin())
const setUsuario = useAuthStore((s) => s.setUsuario)  // após editar perfil/foto

import { toast, useUIStore } from '@/store/uiStore'
toast.sucesso('Salvo!'); toast.erro('Falhou'); toast.info('...'); toast.aviso('...')
const pedirConfirmacao = useUIStore((s) => s.pedirConfirmacao)
const mostrarAlerta = useUIStore((s) => s.mostrarAlerta)
```

## Feedback ao usuário (REGRAS)

- **NUNCA** use `alert()`, `confirm()`, `prompt()` nativos.
- Notificações rápidas → `toast.sucesso/erro/aviso/info(msg)`.
- Confirmação de ação destrutiva → `pedirConfirmacao({ mensagem, tipo:'danger', onConfirmar })`.
- Aviso modal → `mostrarAlerta({ mensagem, tipo })`.

## Componentes prontos — `src/components/`

- `cavi/` (estética): `PropertyCard`, `BrokerCard`, `PublicHeader`, `Avatar`, `StatCard`,
  `Badge` (genérico: `<Badge cor bg>{texto}</Badge>`).
- `form/Field.tsx`: `TextField`, `TextAreaField`, `SelectField`, `SubmitButton` (named exports).
  Campos controlados: `<TextField label name value onChange={(v)=>...} erro={err.campo('x')} obrigatorio />`.
- `ui/Pagination.tsx` (default): `<Pagination pagina totalPaginas onPagina={(p)=>...} />`.
- `ui/EmptyState.tsx` (default): `<EmptyState icon titulo mensagem>{children}</EmptyState>`.
- `ui/Spinner.tsx` (default): `<Spinner texto?/>`.
- `ui/Toasts.tsx`, `ui/ConfirmModal.tsx`, `ui/AlertModal.tsx`: já montados nos layouts via stores
  (use `toast`/`pedirConfirmacao`/`mostrarAlerta`, não renderize manualmente).
- `layout/`: `SiteLayout` (público), `BrokerLayout` (corretor), `AdminLayout` (admin).
- `routing/`: `RootGate`, `CorretorRoute`, `AdminRoute`, `RouteError`.

## Leitura de dados — `src/hooks/useFetch.ts`

```ts
import { useFetch } from '@/hooks/useFetch'
const { data, carregando, erro, recarregar } = useFetch<PaginaResponse<ImovelResumo>>(
  (signal) => api.get('/imoveis', { params: { pagina }, signal }),
  [pagina],
)
```
Renderize `<Spinner/>` quando `carregando`, trate `erro`, depois use `data`.

## Formatação — `src/lib/format.ts`

Genéricos: `formatarData`, `formatarDataHora`, `formatarHora`, `formatarMoeda`, `formatarBytes`.
CAVI: `formatarPrecoImovel(preco, finalidade)`, `formatarArea(area)`, `linkWhatsApp(numero, msg?)`,
`urlMidia(caminho)` (resolve caminho de mídia servida em `/static`).

## Máscaras de input — `src/lib/masks.ts`

Para campos controlados que exibem valor mascarado mas enviam valor limpo ao backend.
Já usadas em `AuthPage` (CPF/telefone), `ConfigSitePage` (telefone) e `ImovelFormPage` (preço):
`apenasDigitos`, `mascararCpf`, `mascararTelefone`, `mascararMoeda`,
`formatarNumeroComoMoedaInput(numero)` (number → string mascarada),
`moedaParaNumero(string)` (string mascarada → number). **Reutilize**; não reimplemente máscara.

## Validação de formulários — Zod (`src/lib/schemas.ts`)

Schemas reutilizáveis já definidos (espelham os DTOs/validators do backend):
`loginSchema`, `cadastroCorretorSchema`, `esqueciSenhaSchema`, `redefinirSenhaSchema`,
`editarPerfilSchema`, `alterarSenhaSchema`, `contaSiteSchema`, `imovelSchema`,
`enderecoImovelSchema`, `filtrosCatalogoSchema`, além de helpers (`senhaSchema`, `emailSchema`,
`cpfSchema`, `telefoneSchema`, `corSchema`). **Reutilize**; só crie schema novo se não houver.

```ts
import { imovelSchema } from '@/lib/schemas'
const parsed = imovelSchema.safeParse(form)
if (!parsed.success) { setErros(parsed.error.flatten().fieldErrors); return }
try { await api.post('/imoveis', parsed.data) }
catch (e) { if (e instanceof ApiError && e.errors) setErros(e.errors); else toast.erro((e as Error).message) }
```

## Navegação

`import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'`.
Use `<Link to>` em vez de `<a href>`. Rotas já registradas no router (não altere).
Áreas: público (`/`, `/catalogos`, `/login`, `/esqueci-senha`, `/redefinir-senha`),
catálogo público (`/v/:slug`, `/v/:slug/imovel/:id`), corretor (`/app/*`), admin (`/admin/*`).

## Visual / estética CAVI

- **Sem Bootstrap, sem classes utilitárias de framework, sem `bi bi-` icons.**
- Estilize com **inline styles** usando tokens de `src/lib/theme.ts`:
  ```ts
  import { colors, fonts } from '@/lib/theme'
  <div style={{ background: colors.bg, color: colors.ink, fontFamily: fonts.body }}>
  ```
  Fontes: `fonts.body` (Hanken Grotesk) no corpo, `fonts.display` (Jost) em títulos.
  Cores principais: `bg`, `ink`, `orange`/`orangeDeep` (destaque), `green`/`greenText` (WhatsApp/ok),
  `muted`/`faint` (textos secundários), `border`/`field` (bordas e inputs), `cream`.
- Ícones: glyphs Unicode inline (ex: `↗`, `⊙`, `⌂`, `⚙`) — siga o padrão dos componentes existentes.
- Cards: fundo branco, `border: 1px solid colors.border`, `borderRadius` ~14–16, sombra leve.
  Reutilize `PropertyCard`/`BrokerCard`/`StatCard` quando couber.
- Antes de estilizar do zero, **olhe um componente vizinho** (`components/cavi/*`, `form/Field.tsx`)
  e replique espaçamento, tipografia e tokens. O protótipo de referência vive em `design/cavi-react/`.

## Regras de saída

- Cada página é **default export**, nome do componente = nome do arquivo.
- TypeScript **strict** + `noUnusedLocals/Parameters`: não deixe imports/vars sem uso.
- Não use `any` implícito; tipe tudo. O build roda `tsc -b` — precisa passar.
