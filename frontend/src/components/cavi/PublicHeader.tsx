import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { colors, fonts } from '../../lib/theme'
import { useAuthStore } from '../../store/authStore'

// Cabeçalho fixo da home pública / marketing.
// Anônimo: Entrar + "Criar meu catálogo". Logado: "Olá, {nome}" com menu
// suspenso (Painel do corretor/admin + Sair).
export default function PublicHeader() {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const logout = useAuthStore((s) => s.logout)
  const [menuAberto, setMenuAberto] = useState(false)

  const linkStyle = { fontSize: 15, color: colors.muted, cursor: 'pointer' } as const
  const primeiroNome = usuario?.nome?.split(' ')[0] ?? ''
  const destinoPainel = isAdmin() ? '/admin' : '/app'

  async function sair() {
    setMenuAberto(false)
    await logout()
    navigate('/')
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(250,248,243,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 40px',
          height: 74,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}
        >
          <img src="/assets/logo-icon-orange.svg" alt="" style={{ height: 30, display: 'block' }} />
          <img src="/assets/logo-name-orange.svg" alt="CAVI" style={{ height: 22, display: 'block' }} />
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <span
            style={linkStyle}
            onClick={() => navigate('/catalogos')}
          >
            Ver catálogos
          </span>

          {usuario ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuAberto((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#fff',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 15,
                  fontWeight: 600,
                  color: colors.ink,
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: colors.orange,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: fonts.display,
                  }}
                >
                  {primeiroNome.charAt(0).toUpperCase()}
                </span>
                Olá, {primeiroNome}
                <span style={{ fontSize: 11, color: colors.mutedSoft }}>▾</span>
              </button>

              {menuAberto && (
                <>
                  {/* clique-fora fecha o menu */}
                  <div
                    onClick={() => setMenuAberto(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 60 }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      zIndex: 61,
                      minWidth: 200,
                      background: '#fff',
                      border: `1px solid ${colors.border}`,
                      borderRadius: 12,
                      boxShadow: '0 16px 40px -18px rgba(60,45,25,0.35)',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => {
                        setMenuAberto(false)
                        navigate(destinoPainel)
                      }}
                      style={menuItemStyle}
                    >
                      <span style={{ color: colors.orange }}>◳</span>
                      {isAdmin() ? 'Painel administrativo' : 'Área do corretor'}
                    </button>
                    <div style={{ height: 1, background: colors.borderSoft }} />
                    <button onClick={sair} style={{ ...menuItemStyle, color: '#c0392b' }}>
                      <span>⏻</span> Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <span style={linkStyle} onClick={() => navigate('/login')}>
                Entrar
              </span>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: colors.orange,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '11px 22px',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                Criar meu catálogo
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

const menuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  background: 'none',
  border: 'none',
  textAlign: 'left' as const,
  padding: '12px 16px',
  fontSize: 14,
  fontWeight: 600,
  color: colors.ink,
  cursor: 'pointer',
}
