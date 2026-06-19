import { Outlet, useNavigate, Link } from 'react-router';
import { colors } from '../theme.js';

// Casca da administração da plataforma: sidebar escura + conteúdo.
export default function AdminLayout() {
  const navigate = useNavigate();
  const inactive = { display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10, cursor: 'default', fontWeight: 600, fontSize: 15, color: '#6b655b' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg }}>
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
        <Link to="/" style={{ margin: '8px 8px 8px' }}>
          <img src="/assets/logo-cream.png" alt="CAVI" style={{ height: 26, cursor: 'pointer', display: 'block' }} />
        </Link>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#7d766a', margin: '0 8px 24px' }}>
          Administração
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 15, color: colors.ink, background: colors.orange }}>
            <span style={{ fontSize: 17 }}>☷</span> Corretores
          </div>
          <div style={inactive}><span style={{ fontSize: 17 }}>⊞</span> Visão geral</div>
          <div style={inactive}><span style={{ fontSize: 17 }}>◷</span> Assinaturas</div>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 15, color: '#7d766a' }}
            onClick={() => navigate('/')}
          >
            <span style={{ fontSize: 17 }}>⏻</span> Sair
          </div>
        </div>
      </aside>
      <main style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
