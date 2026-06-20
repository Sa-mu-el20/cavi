# CAVI — MVP (React)

Vitrine de imóveis para corretores e pequenas imobiliárias. Conversão do protótipo de tela única para um projeto React real, componentizado, navegável por rotas e com dados fictícios em JSON.

## Rodar

```bash
cd cavi-react
npm install
npm run dev
```

Build de produção: `npm run build` · pré-visualizar build: `npm run preview`.

## Stack

- **Vite** + **React 19**
- **react-router v8** para navegação real (URLs) — imports do pacote `react-router` (o `react-router-dom` foi removido na v8)
- Estilos inline (mesma identidade visual do protótipo), tokens centralizados em `src/theme.js`
- Estado em memória via Context (`src/store.jsx`), partindo dos JSONs

## Rotas

| Rota | Tela |
|------|------|
| `/` | Home pública (marketing + vitrines) |
| `/login` | Entrar / Criar conta |
| `/recuperar-senha` | Recuperação de senha (envio de link) |
| `/v/:slug` | Catálogo público do corretor |
| `/v/:slug/imovel/:id` | Detalhe do imóvel |
| `/app` | Painel do corretor |
| `/app/imoveis` | Lista de imóveis (busca + filtro de status) |
| `/app/imoveis/novo` · `/app/imoveis/:id/editar` | Formulário de imóvel |
| `/app/config` | Configurações da vitrine |
| `/admin` | Administração da plataforma |

## Estrutura

```
src/
  main.jsx            # bootstrap (Router + DataProvider)
  App.jsx             # mapa de rotas
  theme.js            # paleta e fontes
  store.jsx           # Context: imóveis, corretores e ações
  data/
    corretores.json   # 6 corretores fictícios
    imoveis.json      # 9 imóveis fictícios
  lib/format.js       # formatação de preço, link de WhatsApp, cores por estado
  components/         # Avatar, Badge, StatCard, PropertyCard, BrokerCard, PublicHeader
  layouts/            # SiteLayout, BrokerLayout, AdminLayout
  pages/              # Home, Auth, Catalog, PropertyDetail, Dashboard,
                      # Properties, PropertyForm, Config, Admin
public/assets/        # logos + fotos dos imóveis
```

## Dados fictícios

Toda a base vive em `src/data/*.json` e é carregada no `DataProvider`. As ações de **publicar/ocultar imóvel** e **ativar/desativar corretor** alteram o estado em memória (não há backend). Os imóveis estão associados ao corretor logado (`Albuquerque Imóveis`, `corretorId: 1`); ligar outras vitrines a uma API ou a mais imóveis é só estender os JSONs.

## Próximos passos sugeridos

- Persistir o formulário de imóvel (hoje os campos são `defaultValue`; o submit apenas navega).
- Trocar o Context por uma camada de API real quando houver backend.
- Escopar imóveis por corretor para que cada vitrine tenha seu próprio catálogo.
