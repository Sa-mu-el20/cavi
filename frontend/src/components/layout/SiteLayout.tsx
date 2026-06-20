import { Outlet, useOutletContext, useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useFetch } from '../../hooks/useFetch'
import { colors, fonts } from '../../lib/theme'
import { linkWhatsApp } from '../../lib/format'
import type { VitrinePublica } from '../../lib/types'
import Avatar from '../cavi/Avatar'

// Contexto exposto às páginas filhas da vitrine pública.
export interface VitrineContext {
  slug: string
  vitrine: VitrinePublica
}

export function useVitrine(): VitrineContext {
  return useOutletContext<VitrineContext>()
}

// Casca da vitrine pública de um corretor: header + conteúdo + rodapé.
// Porte de cavi-react/src/layouts/SiteLayout.jsx. Busca o cabeçalho da vitrine
// (GET /api/publico/vitrine/{slug}) e o expõe via Outlet context.
export default function SiteLayout() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()

  const { data: vitrine, carregando, erro } = useFetch<VitrinePublica>(
    (signal) => api.get<VitrinePublica>(`/publico/vitrine/${slug}`, { signal }),
    [slug],
  )

  if (carregando) {
    return (
      <div
        className="cavi-root"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.muted,
        }}
      >
        Carregando vitrine…
      </div>
    )
  }

  if (erro || !vitrine) {
    return (
      <div
        className="cavi-root"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          textAlign: 'center',
          padding: 24,
        }}
      >
        <div style={{ fontFamily: fonts.display, fontSize: 28, fontWeight: 500 }}>
          Vitrine não encontrada
        </div>
        <div style={{ color: colors.muted }}>
          A vitrine “{slug}” não existe ou não está ativa.
        </div>
        <Link to="/" style={{ color: colors.orange, fontWeight: 600, marginTop: 8 }}>
          ← Voltar ao CAVI
        </Link>
      </div>
    )
  }

  const local = [vitrine.bairro, vitrine.cidade].filter(Boolean).join(', ')

  return (
    <div className="cavi-root" style={{ minHeight: '100vh', background: colors.bg }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: '#fff',
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            padding: '0 40px',
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            onClick={() => navigate(`/v/${vitrine.slug}`)}
          >
            <Avatar corretor={vitrine} size={40} radius={10} fontSize={18} />
            <div>
              <div
                style={{
                  fontFamily: fonts.display,
                  fontWeight: 500,
                  fontSize: 19,
                  lineHeight: 1.1,
                }}
              >
                {vitrine.nome_publico}
              </div>
              {vitrine.creci && (
                <div style={{ fontSize: 12, color: colors.mutedSoft }}>{vitrine.creci}</div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                color: colors.faint,
                textDecoration: 'none',
              }}
            >
              ← CAVI
            </Link>
            <span style={{ width: 1, height: 20, background: colors.border }} />
            <span
              style={{ fontSize: 15, color: colors.muted, cursor: 'pointer' }}
              onClick={() => navigate(`/v/${vitrine.slug}`)}
            >
              Imóveis
            </span>
            {vitrine.whatsapp && (
              <a
                href={linkWhatsApp(vitrine.whatsapp)}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: colors.green,
                  color: colors.greenDark,
                  textDecoration: 'none',
                  borderRadius: 10,
                  padding: '10px 18px',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </header>

      <Outlet context={{ slug, vitrine } satisfies VitrineContext} />

      <footer style={{ background: colors.ink, marginTop: 64 }}>
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            padding: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: fonts.display,
                fontWeight: 500,
                fontSize: 20,
                color: colors.bg,
              }}
            >
              {vitrine.nome_publico}
            </div>
            <div style={{ fontSize: 13, color: '#8a8275', marginTop: 4 }}>
              {[local, vitrine.creci].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ fontSize: 12, color: '#6b655b' }}>feito com</span>
            <Link
              to="/"
              style={{ display: 'inline-flex', textDecoration: 'none', opacity: 0.85 }}
            >
              <img src="/assets/logo-name-cream.svg" alt="CAVI" style={{ height: 16, display: 'block' }} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
