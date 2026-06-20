import { Outlet, NavLink, useNavigate, Link } from 'react-router';
import { useData } from '../store.jsx';
import { colors } from '../theme.js';

function Item({ to, end, icon, children }) {
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
  );
}

// Casca do painel do corretor: sidebar clara + conteúdo.
export default function BrokerLayout() {
  const navigate = useNavigate();
  const { broker } = useData();
  const ghost = { display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 15 };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg }}>
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
        <Link to="/" style={{ margin: '8px 8px 26px' }}>
          <img src="/assets/logo-orange.png" alt="CAVI" style={{ height: 26, cursor: 'pointer', display: 'block' }} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 12, background: colors.bg, borderRadius: 12, marginBottom: 20 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff', background: colors.orange }}>
            {broker.site[0]}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{broker.site}</div>
            <div style={{ fontSize: 12, color: colors.mutedSoft }}>Plano {broker.plano}</div>
          </div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Item to="/app" end icon="◳">Painel</Item>
          <Item to="/app/imoveis" icon="⌂">Meus imóveis</Item>
          <Item to="/app/config" icon="⚙">Configurar site</Item>
        </nav>
        <div style={{ height: 1, background: colors.borderSoft, margin: '16px 8px' }} />
        <div style={{ ...ghost, color: colors.muted }} onClick={() => navigate(`/v/${broker.slug}`)}>
          <span style={{ fontSize: 17 }}>↗</span> Ver meu catálogo
        </div>
        <div style={{ marginTop: 'auto' }}>
          <div style={{ ...ghost, color: '#a89f90' }} onClick={() => navigate('/')}>
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
