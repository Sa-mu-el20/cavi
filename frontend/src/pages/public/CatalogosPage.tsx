import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { linkWhatsApp } from '../../lib/format'
import { colors, fonts } from '../../lib/theme'
import type { CorretorCatalogo } from '../../lib/types'
import { useFetch } from '../../hooks/useFetch'
import Avatar from '../../components/cavi/Avatar'
import PublicHeader from '../../components/cavi/PublicHeader'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'

export default function CatalogosPage() {
  const navigate = useNavigate()
  const carregarCorretores = useCallback(
    (signal: AbortSignal) => api.get<CorretorCatalogo[]>('/publico/corretores', { signal }),
    [],
  )
  const { data: corretores, carregando, erro } = useFetch(carregarCorretores)

  const catalogos = useMemo(
    () =>
      [...(corretores ?? [])].sort((a, b) =>
        a.nome_publico.localeCompare(b.nome_publico, 'pt-BR', { sensitivity: 'base' }),
      ),
    [corretores],
  )

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: fonts.body }}>
      <PublicHeader />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '58px 40px 76px' }}>
        <div style={{ marginBottom: 34 }}>
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
            Catálogos no ar
          </div>
          <h1
            style={{
              fontFamily: fonts.display,
              fontWeight: 300,
              fontSize: 44,
              lineHeight: 1.08,
              margin: '0 0 12px',
            }}
          >
            Corretores na CAVI
          </h1>
          <p style={{ maxWidth: 560, fontSize: 17, lineHeight: 1.55, color: colors.muted, margin: 0 }}>
            Encontre catálogos públicos de corretores e imobiliárias cadastrados na plataforma.
          </p>
        </div>

        {carregando ? (
          <Spinner texto="Carregando catálogos..." />
        ) : erro ? (
          <EmptyState
            icon="⚠"
            titulo="Não foi possível carregar os catálogos"
            mensagem={erro.message}
          />
        ) : catalogos.length === 0 ? (
          <EmptyState
            icon="◳"
            titulo="Nenhum catálogo publicado ainda"
            mensagem="Seja o primeiro corretor a publicar seu catálogo na CAVI."
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 24,
              alignItems: 'stretch',
            }}
          >
            {catalogos.map((corretor) => (
              <CatalogoCard
                key={corretor.slug}
                corretor={corretor}
                onAbrir={() => navigate(`/v/${corretor.slug}`)}
              />
            ))}
          </div>
        )}
      </main>

      <footer style={{ borderTop: `1px solid ${colors.border}` }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '30px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          <span style={{ display: 'inline-flex', opacity: 0.85 }}>
            <img src="/assets/logo-name-orange.svg" alt="CAVI" style={{ height: 20, display: 'block' }} />
          </span>
          <div style={{ fontSize: 13, color: colors.mutedSoft }}>
            © 2026 CAVI · Termos de uso · Privacidade
          </div>
        </div>
      </footer>
    </div>
  )
}

function CatalogoCard({
  corretor,
  onAbrir,
}: {
  corretor: CorretorCatalogo
  onAbrir: () => void
}) {
  const local = [corretor.bairro, corretor.cidade, corretor.uf].filter(Boolean).join(' · ')
  const whatsapp = corretor.whatsapp ? linkWhatsApp(corretor.whatsapp) : ''

  return (
    <article
      style={{
        background: '#fff',
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 244,
        boxShadow: '0 18px 40px -28px rgba(60,45,25,0.28)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <Avatar corretor={corretor} size={50} radius={11} fontSize={22} />
        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              fontFamily: fonts.display,
              fontWeight: 500,
              fontSize: 22,
              lineHeight: 1.16,
              margin: '0 0 3px',
              color: colors.ink,
              overflowWrap: 'anywhere',
            }}
          >
            {corretor.nome_publico}
          </h2>
          {corretor.creci && (
            <div style={{ fontSize: 13, color: colors.mutedSoft }}>{corretor.creci}</div>
          )}
        </div>
      </div>

      <p
        style={{
          fontSize: 16,
          lineHeight: 1.5,
          color: colors.muted,
          margin: '0 0 16px',
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {corretor.descricao || 'Catálogo público de imóveis cadastrado na CAVI.'}
      </p>

      <div style={{ fontSize: 14, color: colors.mutedSoft, marginBottom: 18 }}>
        {local || 'Região de atuação'}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button
          onClick={onAbrir}
          style={{
            background: '#fff',
            color: colors.ink,
            border: `1px solid ${colors.field}`,
            borderRadius: 9,
            padding: '12px 10px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Ver catálogo
        </button>
        {whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            style={{
              background: colors.green,
              color: colors.greenDark,
              borderRadius: 9,
              padding: '12px 10px',
              fontSize: 14,
              fontWeight: 700,
              textAlign: 'center',
              textDecoration: 'none',
            }}
          >
            WhatsApp
          </a>
        ) : (
          <span
            aria-disabled="true"
            style={{
              background: colors.cream,
              color: colors.faint,
              borderRadius: 9,
              padding: '12px 10px',
              fontSize: 14,
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            WhatsApp
          </span>
        )}
      </div>
    </article>
  )
}
