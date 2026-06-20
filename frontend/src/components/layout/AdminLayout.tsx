import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { colors } from '../../lib/theme'

// Casca da administração da plataforma: sidebar escura + conteúdo.
// Porte de cavi-react/src/layouts/AdminLayout.jsx. Usa authStore (logout).
export default function AdminLayout() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  const inativo = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 12px',
    borderRadius: 10,
    cursor: 'default',
    fontWeight: 600,
    fontSize: 15,
    color: '#6b655b',
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
          background: colors.ink,
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
            margin: '8px 8px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            textDecoration: 'none',
          }}
        >
          <img src="/assets/logo-icon-cream.svg" alt="" style={{ height: 28, display: 'block' }} />
          <img src="/assets/logo-name-cream.svg" alt="CAVI" style={{ height: 20, display: 'block' }} />
        </Link>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: '#7d766a',
            margin: '0 8px 24px',
          }}
        >
          Administração
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
          <NavLink
            to="/admin/perfil"
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
            <span style={{ fontSize: 17 }}>⊙</span> Meu perfil
          </NavLink>
          <div style={inativo}>
            <span style={{ fontSize: 17 }}>◷</span> Assinaturas
          </div>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 12px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 15,
              color: '#7d766a',
            }}
            onClick={sair}
          >
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
