import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { colors, fonts } from '../../lib/theme'
import type { CorretorVitrine } from '../../lib/types'
import { useFetch } from '../../hooks/useFetch'
import PublicHeader from '../../components/cavi/PublicHeader'
import BrokerCard from '../../components/cavi/BrokerCard'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

// Home pública do CAVI: hero + lista de vitrines ativas (GET /publico/corretores).
// Porte fiel de cavi-react/src/pages/Home.jsx, mas ligado à API real (sem JSON local):
// dados vêm de useFetch -> api.get; cards usam o BrokerCard real (link p/ /v/:slug);
// CTAs "sou corretor"/criar vitrine levam ao /login.

const PASSOS = [
  {
    n: '01',
    t: 'Crie sua conta',
    d: 'Informe seu CRECI e dados de contato. Sua vitrine ganha um endereço próprio em segundos.',
  },
  {
    n: '02',
    t: 'Cadastre seus imóveis',
    d: 'Fotos, preço, características e localização. Publique ou deixe oculto enquanto prepara o anúncio.',
  },
  {
    n: '03',
    t: 'Receba interessados',
    d: 'Compartilhe o link. Cada imóvel tem um botão de WhatsApp que leva o contato direto para você.',
  },
]

const HERO_IMOVEIS_EXEMPLO = [
  {
    preco: 'R$ 890.000',
    detalhes: '2 quartos · 78m²',
    foto: '/assets/hero-property-apartment.jpg',
    alt: 'Sala integrada de apartamento moderno com varanda',
  },
  {
    preco: 'R$ 1.180.000',
    detalhes: '3 quartos · 110m²',
    foto: '/assets/hero-property-balcony.jpg',
    alt: 'Varanda ampla de imóvel moderno com paisagismo',
  },
]

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()

  const carregarCorretores = useCallback(
    (signal: AbortSignal) => api.get<CorretorVitrine[]>('/publico/corretores', { signal }),
    [],
  )
  const { data: corretores, carregando, erro } = useFetch(carregarCorretores)

  const verPrimeiraVitrine = () => {
    const slug = corretores?.[0]?.slug
    navigate(slug ? `/v/${slug}` : '/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: fonts.body }}>
      <PublicHeader />

      {/* HERO */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '84px 40px 56px',
          display: 'grid',
          gridTemplateColumns: '1.05fr 0.95fr',
          gap: 64,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#e6eed6',
              color: colors.greenText,
              padding: '7px 14px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 26,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: colors.green }} />{' '}
            Para corretores e pequenas imobiliárias
          </div>
          <h1
            style={{
              fontFamily: fonts.display,
              fontWeight: 300,
              fontSize: 60,
              lineHeight: 1.04,
              letterSpacing: -1,
              margin: '0 0 22px',
            }}
          >
            Sua vitrine de imóveis,{' '}
            <span style={{ color: colors.orange, fontWeight: 500 }}>pronta para vender.</span>
          </h1>
          <p
            style={{
              fontSize: 19,
              lineHeight: 1.55,
              color: colors.muted,
              margin: '0 0 36px',
              maxWidth: 480,
            }}
          >
            Cadastre seus imóveis, publique um catálogo profissional com seu nome e receba
            interessados direto no WhatsApp. Sem comissão de plataforma, sem complicação.
          </p>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: colors.orange,
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '16px 30px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              Começar gratuitamente
            </button>
            <button
              onClick={verPrimeiraVitrine}
              style={{
                background: 'transparent',
                color: colors.ink,
                border: '1px solid #d8d0c2',
                borderRadius: 12,
                padding: '16px 26px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              Ver uma vitrine →
            </button>
          </div>
          <div style={{ display: 'flex', gap: 30, marginTop: 44 }}>
            {(
              [
                [String(corretores?.length ?? 0), 'corretores ativos'],
                [
                  String(
                    (corretores ?? []).reduce((s, c) => s + (c.qtd_imoveis_publicados || 0), 0),
                  ),
                  'imóveis publicados',
                ],
                [
                  String(new Set((corretores ?? []).map((c) => c.cidade).filter(Boolean)).size),
                  'cidades',
                ],
              ] as [string, string][]
            ).map(([v, l], i) => (
              <div key={l} style={{ display: 'flex', gap: 30 }}>
                {i > 0 && <div style={{ width: 1, background: colors.border }} />}
                <div>
                  <div style={{ fontFamily: fonts.display, fontSize: 30, fontWeight: 500 }}>{v}</div>
                  <div style={{ fontSize: 13, color: colors.mutedSoft }}>{l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* mock visual da vitrine (decorativo) */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              background: '#fff',
              border: `1px solid ${colors.border}`,
              borderRadius: 18,
              boxShadow: '0 30px 60px -28px rgba(60,45,25,0.30)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: 40,
                background: colors.cream,
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '0 16px',
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{ width: 10, height: 10, borderRadius: '50%', background: '#e4ddcd' }}
                />
              ))}
              <span style={{ marginLeft: 12, fontSize: 12, color: colors.faint }}>
                cavi.ifes.site/albuquerque
              </span>
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: colors.orange,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  A
                </div>
                <div style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 17 }}>
                  Albuquerque Imóveis
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {HERO_IMOVEIS_EXEMPLO.map((imovel) => (
                  <div
                    key={imovel.preco}
                    style={{ border: `1px solid ${colors.borderSoft}`, borderRadius: 10, overflow: 'hidden' }}
                  >
                    <img
                      src={imovel.foto}
                      alt={imovel.alt}
                      style={{
                        width: '100%',
                        height: 108,
                        objectFit: 'cover',
                        display: 'block',
                        background: colors.cream,
                      }}
                    />
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: colors.orange }}>
                        {imovel.preco}
                      </div>
                      <div style={{ fontSize: 11, color: colors.mutedSoft }}>{imovel.detalhes}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 40px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <Eyebrow>Como funciona</Eyebrow>
          <h2
            style={{
              fontFamily: fonts.display,
              fontWeight: 300,
              fontSize: 38,
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            No ar em três passos
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
          {PASSOS.map((p) => (
            <div
              key={p.n}
              style={{
                background: '#fff',
                border: `1px solid ${colors.border}`,
                borderRadius: 16,
                padding: 34,
              }}
            >
              <div
                style={{
                  fontFamily: fonts.display,
                  fontSize: 15,
                  fontWeight: 600,
                  color: colors.orange,
                  marginBottom: 18,
                }}
              >
                {p.n}
              </div>
              <h3
                style={{
                  fontFamily: fonts.display,
                  fontWeight: 500,
                  fontSize: 22,
                  margin: '0 0 10px',
                }}
              >
                {p.t}
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: colors.muted, margin: 0 }}>{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CORRETORES (vitrines no ar) */}
      <section
        id="vitrines"
        style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 40px 40px', scrollMarginTop: 90 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 30,
          }}
        >
          <div>
            <Eyebrow>Vitrines no ar</Eyebrow>
            <h2
              style={{
                fontFamily: fonts.display,
                fontWeight: 300,
                fontSize: 38,
                margin: 0,
                letterSpacing: -0.5,
              }}
            >
              Corretores na CAVI
            </h2>
          </div>
          {(corretores?.length ?? 0) > 0 && (
            <span
              style={{ fontSize: 15, color: colors.muted, cursor: 'pointer' }}
              onClick={verPrimeiraVitrine}
            >
              Ver todas →
            </span>
          )}
        </div>

        {carregando ? (
          <Spinner texto="Carregando vitrines..." />
        ) : erro ? (
          <EmptyState
            icon="⚠"
            titulo="Não foi possível carregar as vitrines"
            mensagem={erro.message}
          />
        ) : (corretores?.length ?? 0) === 0 ? (
          <EmptyState
            icon="◳"
            titulo="Nenhuma vitrine publicada ainda"
            mensagem="Seja o primeiro corretor a publicar sua vitrine na CAVI."
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {corretores!.map((c) => (
              <BrokerCard key={c.slug} corretor={c} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px 80px' }}>
        <div
          style={{
            background: colors.ink,
            borderRadius: 22,
            padding: 64,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 80% 20%, rgba(217,122,43,0.22), transparent 55%)',
            }}
          />
          <div style={{ position: 'relative' }}>
            <h2
              style={{
                fontFamily: fonts.display,
                fontWeight: 300,
                fontSize: 42,
                color: colors.bg,
                margin: '0 0 16px',
                letterSpacing: -0.5,
              }}
            >
              Sua próxima venda começa com uma vitrine.
            </h2>
            <p style={{ fontSize: 18, color: '#bcb4a6', margin: '0 0 32px' }}>
              Comece com o plano gratuito. Sem cartão de crédito.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: colors.orange,
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '16px 34px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              Criar minha vitrine
            </button>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${colors.border}` }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '36px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ display: 'inline-flex', opacity: 0.85 }}>
            <img src="/assets/logo-name-orange.svg" alt="CAVI" style={{ height: 20, display: 'block' }} />
          </span>
          <div style={{ fontSize: 13, color: colors.mutedSoft }}>
            © 2026 CAVI · Termos de uso · Privacidade ·{' '}
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>
              Sou corretor
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
