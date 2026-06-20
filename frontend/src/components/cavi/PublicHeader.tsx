import { Link, useNavigate } from 'react-router-dom'
import { colors } from '../../lib/theme'

// Cabeçalho fixo da home pública / marketing.
// Porte de cavi-react/src/components/PublicHeader.jsx. Sem asset de logo no app
// real: usamos wordmark em Jost na cor da marca.
export default function PublicHeader() {
  const navigate = useNavigate()
  const linkStyle = { fontSize: 15, color: colors.muted, cursor: 'pointer' } as const

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
          <span style={linkStyle} onClick={() => navigate('/login')}>
            Planos
          </span>
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
            Criar minha vitrine
          </button>
        </nav>
      </div>
    </header>
  )
}
