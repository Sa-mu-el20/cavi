import type { ReactNode } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useFetch } from '../../hooks/useFetch'
import { useAuthStore } from '../../store/authStore'
import { colors, fonts } from '../../lib/theme'
import type { ContaSite } from '../../lib/types'

interface ItemProps {
  to: string
  end?: boolean
  icon: ReactNode
  children: ReactNode
}

function Item({ to, end, icon, children }: ItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
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
        color: isActive ? colors.orangeDeep : colors.muted,
        background: isActive ? '#fbeedd' : 'transparent',
      })}
    >
      <span style={{ fontSize: 17 }}>{icon}</span> {children}
    </NavLink>
  )
}

// Casca do painel do corretor: sidebar clara + conteúdo.
// Porte de cavi-react/src/layouts/BrokerLayout.jsx. Usa authStore (logout) e
// busca a própria conta (GET /api/minha-conta) para a marca da sidebar.
export default function BrokerLayout() {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)

  const { data: conta } = useFetch<ContaSite>(
    (signal) => api.get<ContaSite>('/minha-conta', { signal }),
    [],
  )

  const nome = conta?.nome_publico ?? usuario?.nome ?? 'Minha vitrine'
  const inicial = nome ? nome[0].toUpperCase() : '?'
  const subtitulo = [conta?.cidade, conta?.uf].filter(Boolean).join(' / ') || 'Corretor'

  const ghost = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 12px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 15,
  } as const

  async function sair() {
    await logout()
    navigate('/login')
  }

  return (
    <div
      className="cavi-root"
      style={{ display: 'flex', minHeight: '100vh', background: colors.bg }}
    >
      <aside
        style={{
          width: 248,
          flex: 'none',
          background: '#fff',
          borderRight: `1px solid ${colors.border}`,
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <Link
          to="/"
          style={{
            margin: '8px 8px 26px',
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: 1,
            color: colors.orange,
            textDecoration: 'none',
          }}
        >
          CAVI
        </Link>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            padding: 12,
            background: colors.bg,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 16,
              color: '#fff',
              background: conta?.cor || colors.orange,
            }}
          >
            {inicial}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 14,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {nome}
            </div>
            <div style={{ fontSize: 12, color: colors.mutedSoft }}>{subtitulo}</div>
          </div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Item to="/app" end icon="◳">
            Painel
          </Item>
          <Item to="/app/imoveis" icon="⌂">
            Meus imóveis
          </Item>
          <Item to="/app/config" icon="⚙">
            Configurar site
          </Item>
        </nav>
        <div style={{ height: 1, background: colors.borderSoft, margin: '16px 8px' }} />
        {conta?.slug && (
          <div
            style={{ ...ghost, color: colors.muted }}
            onClick={() => navigate(`/v/${conta.slug}`)}
          >
            <span style={{ fontSize: 17 }}>↗</span> Ver minha vitrine
          </div>
        )}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ ...ghost, color: '#a89f90' }} onClick={sair}>
            <span style={{ fontSize: 17 }}>⏻</span> Sair
          </div>
        </div>
      </aside>
      <main style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  )
}
