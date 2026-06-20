// Catálogo público da vitrine (/v/:slug). Porte de cavi-react/src/pages/Catalog.jsx,
// ligado à API real: cabeçalho via contexto do SiteLayout (GET /api/publico/vitrine/{slug})
// e listagem paginada com filtros (GET /api/publico/vitrine/{slug}/imoveis).
import { useMemo, useState } from 'react'
import { api } from '../../lib/api'
import { useFetch } from '../../hooks/useFetch'
import { colors, fonts } from '../../lib/theme'
import { FinalidadeImovel, TipoImovel } from '../../lib/types'
import type { ImovelResumo, PaginaResponse } from '../../lib/types'
import { useVitrine } from '../../components/layout/SiteLayout'
import PropertyCard from '../../components/cavi/PropertyCard'
import Pagination from '../../components/ui/Pagination'

const POR_PAGINA = 12

interface Filtros {
  finalidade: string
  tipo: string
  bairro: string
  precoMax: string
}

const FILTROS_VAZIOS: Filtros = { finalidade: '', tipo: '', bairro: '', precoMax: '' }

const PRECOS_MAX = [
  { valor: '600000', rotulo: 'até R$ 600 mil' },
  { valor: '1000000', rotulo: 'até R$ 1 mi' },
  { valor: '1500000', rotulo: 'até R$ 1,5 mi' },
  { valor: '2000000', rotulo: 'até R$ 2 mi' },
]

const campoStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 140,
  padding: '12px 14px',
  border: `1px solid ${colors.field}`,
  borderRadius: 10,
  fontSize: 15,
  background: '#fff',
  color: colors.ink,
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children: React.ReactNode
}) {
  return (
    <select value={value} onChange={onChange} style={{ ...campoStyle, cursor: 'pointer' }}>
      {children}
    </select>
  )
}

export default function CatalogPage() {
  const { slug, vitrine } = useVitrine()
  const [f, setF] = useState<Filtros>(FILTROS_VAZIOS)
  const [pagina, setPagina] = useState(1)

  const set =
    (k: keyof Filtros) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setF((prev) => ({ ...prev, [k]: e.target.value }))
      setPagina(1)
    }

  // Filtros server-side: monta os params apenas com o que está preenchido.
  const params = useMemo(() => {
    const p: Record<string, string | number> = { pagina, por_pagina: POR_PAGINA }
    if (f.finalidade) p.finalidade = f.finalidade
    if (f.tipo) p.tipo = f.tipo
    if (f.bairro.trim()) p.bairro = f.bairro.trim()
    if (f.precoMax) p.preco_max = Number(f.precoMax)
    return p
  }, [pagina, f])

  const { data, carregando, erro } = useFetch<PaginaResponse<ImovelResumo>>(
    (signal) =>
      api.get<PaginaResponse<ImovelResumo>>(`/publico/vitrine/${slug}/imoveis`, {
        params,
        signal,
      }),
    [slug, params],
  )

  const local = [vitrine.bairro, vitrine.cidade].filter(Boolean).join(', ')
  const itens = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <>
      <section style={{ background: 'linear-gradient(180deg,#fff,#faf8f3)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '46px 40px 30px' }}>
          {local && (
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: colors.green,
                marginBottom: 12,
              }}
            >
              {local}
            </div>
          )}
          <h1
            style={{
              fontFamily: fonts.display,
              fontWeight: 300,
              fontSize: 44,
              margin: '0 0 14px',
              letterSpacing: -0.5,
              maxWidth: 680,
            }}
          >
            {vitrine.descricao || vitrine.nome_publico}
          </h1>
          <div style={{ fontSize: 15, color: colors.mutedSoft }}>
            {carregando
              ? 'Carregando imóveis…'
              : `${total} ${total === 1 ? 'imóvel disponível' : 'imóveis disponíveis'}`}
          </div>
        </div>
      </section>

      {/* filtros */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 40px' }}>
        <div
          style={{
            background: '#fff',
            border: `1px solid ${colors.border}`,
            borderRadius: 14,
            padding: 16,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
            boxShadow: '0 8px 24px -18px rgba(60,45,25,0.30)',
          }}
        >
          <Select value={f.finalidade} onChange={set('finalidade')}>
            <option value="">Finalidade · todas</option>
            <option value={FinalidadeImovel.VENDA}>Venda</option>
            <option value={FinalidadeImovel.ALUGUEL}>Aluguel</option>
          </Select>
          <Select value={f.tipo} onChange={set('tipo')}>
            <option value="">Tipo · todos</option>
            <option value={TipoImovel.APARTAMENTO}>Apartamento</option>
            <option value={TipoImovel.CASA}>Casa</option>
            <option value={TipoImovel.COBERTURA}>Cobertura</option>
            <option value={TipoImovel.STUDIO}>Studio</option>
            <option value={TipoImovel.LOFT}>Loft</option>
            <option value={TipoImovel.SALA_COMERCIAL}>Sala comercial</option>
            <option value={TipoImovel.TERRENO}>Terreno</option>
          </Select>
          <input
            type="text"
            value={f.bairro}
            onChange={set('bairro')}
            placeholder="Bairro"
            style={campoStyle}
          />
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
            style={{
              padding: '12px 18px',
              border: `1px solid ${colors.field}`,
              background: colors.bg,
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: colors.muted,
              cursor: 'pointer',
            }}
          >
            Limpar
          </button>
        </div>
      </div>

      {/* grade */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '30px 40px 0' }}>
        {erro ? (
          <div
            style={{ textAlign: 'center', padding: '60px 0', color: colors.mutedSoft, fontSize: 16 }}
          >
            Não foi possível carregar os imóveis. Tente novamente.
          </div>
        ) : carregando ? (
          <div
            style={{ textAlign: 'center', padding: '60px 0', color: colors.mutedSoft, fontSize: 16 }}
          >
            Carregando imóveis…
          </div>
        ) : itens.length ? (
          <>
            <div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}
            >
              {itens.map((im) => (
                <PropertyCard key={im.id} imovel={im} slug={slug} />
              ))}
            </div>
            {data && data.total_paginas > 1 && (
              <div style={{ marginTop: 36 }}>
                <Pagination
                  pagina={data.pagina}
                  totalPaginas={data.total_paginas}
                  onPagina={setPagina}
                />
              </div>
            )}
          </>
        ) : (
          <div
            style={{ textAlign: 'center', padding: '60px 0', color: colors.mutedSoft, fontSize: 16 }}
          >
            Nenhum imóvel encontrado com esses filtros.
          </div>
        )}
      </div>
    </>
  )
}
