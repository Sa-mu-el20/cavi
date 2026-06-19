import { Link, useNavigate } from 'react-router';
import { colors } from '../theme.js';

// Cabeçalho fixo da home pública / marketing.
export default function PublicHeader() {
  const navigate = useNavigate();
  const linkStyle = { fontSize: 15, color: colors.muted, cursor: 'pointer' };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(250,248,243,0.85)',
        backdropFilter: 'blur(12px)',
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
        <Link to="/">
          <img src="/assets/logo-orange.png" alt="CAVI" style={{ height: 30, width: 'auto', cursor: 'pointer', display: 'block' }} />
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <span style={linkStyle} onClick={() => navigate('/v/albuquerque')}>Ver catálogos</span>
          <span style={linkStyle} onClick={() => navigate('/login')}>Planos</span>
          <span style={linkStyle} onClick={() => navigate('/login')}>Entrar</span>
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
        </nav>
      </div>
    </header>
  );
}
