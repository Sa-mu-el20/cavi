import { Outlet, useOutletContext, useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useFetch } from '../../hooks/useFetch'
import { colors, fonts } from '../../lib/theme'
import { linkWhatsApp } from '../../lib/format'
import type { CatalogoPublico } from '../../lib/types'
import Avatar from '../cavi/Avatar'

// Contexto exposto às páginas filhas do catálogo público.
export interface CatalogoContext {
  slug: string
  catalogo: CatalogoPublico
}

export function useCatalogo(): CatalogoContext {
  return useOutletContext<CatalogoContext>()
}

// Casca do catálogo público de um corretor: header + conteúdo + rodapé.
// Porte de cavi-react/src/layouts/SiteLayout.jsx. Busca o cabeçalho do catálogo
// (GET /api/publico/catalogo/{slug}) e o expõe via Outlet context.
export default function SiteLayout() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()

  const { data: catalogo, carregando, erro } = useFetch<CatalogoPublico>(
    (signal) => api.get<CatalogoPublico>(`/publico/catalogo/${slug}`, { signal }),
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
        Carregando catálogo…
      </div>
    )
  }

  if (erro || !catalogo) {
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
          Catálogo não encontrado
        </div>
        <div style={{ color: colors.muted }}>
          O catálogo “{slug}” não existe ou não está ativo.
        </div>
        <Link to="/" style={{ color: colors.orange, fontWeight: 600, marginTop: 8 }}>
          ← Voltar ao CAVI
        </Link>
      </div>
    )
  }

  const local = [catalogo.bairro, catalogo.cidade].filter(Boolean).join(', ')

  return (
    <div
      className="cavi-root"
      style={{
        minHeight: '100vh',
        background: colors.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
            onClick={() => navigate(`/v/${catalogo.slug}`)}
          >
            <Avatar corretor={catalogo} size={40} radius={10} fontSize={18} />
            <div>
              <div
                style={{
                  fontFamily: fonts.display,
                  fontWeight: 500,
                  fontSize: 19,
                  lineHeight: 1.1,
                }}
              >
                {catalogo.nome_publico}
              </div>
              {catalogo.creci && (
                <div style={{ fontSize: 12, color: colors.mutedSoft }}>{catalogo.creci}</div>
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
              onClick={() => navigate(`/v/${catalogo.slug}`)}
            >
              Imóveis
            </span>
            {catalogo.whatsapp && (
              <a
                href={linkWhatsApp(catalogo.whatsapp)}
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

      <div style={{ flex: 1 }}>
        <Outlet context={{ slug, catalogo } satisfies CatalogoContext} />
      </div>

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
              {catalogo.nome_publico}
            </div>
            <div style={{ fontSize: 13, color: '#8a8275', marginTop: 4 }}>
              {[local, catalogo.creci].filter(Boolean).join(' · ')}
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
