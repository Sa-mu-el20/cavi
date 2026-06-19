import { Outlet, useParams, useNavigate, Link } from 'react-router';
import { useData } from '../store.jsx';
import { colors, fonts } from '../theme.js';
import { waLink } from '../lib/format.js';
import Avatar from '../components/Avatar.jsx';

// Casca do catálogo público de um corretor: header + conteúdo + rodapé.
export default function SiteLayout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { corretorPorSlug } = useData();
  const corretor = corretorPorSlug(slug);

  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
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
            onClick={() => navigate(`/v/${corretor.slug}`)}
          >
            <Avatar corretor={corretor} size={40} radius={10} fontSize={18} />
            <div>
              <div style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 19, lineHeight: 1.1 }}>
                {corretor.site}
              </div>
              <div style={{ fontSize: 12, color: colors.mutedSoft }}>{corretor.creci}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: colors.faint, textDecoration: 'none' }}>
              ← CAVI
            </Link>
            <span style={{ width: 1, height: 20, background: colors.border }} />
            <span style={{ fontSize: 15, color: colors.muted, cursor: 'pointer' }} onClick={() => navigate(`/v/${corretor.slug}`)}>
              Imóveis
            </span>
            <a
              href={waLink(corretor.whatsapp)}
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
          </div>
        </div>
      </header>

      <Outlet context={{ corretor }} />

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
            <div style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 20, color: colors.bg }}>
              {corretor.site}
            </div>
            <div style={{ fontSize: 13, color: '#8a8275', marginTop: 4 }}>
              {corretor.bairro}, {corretor.cidade} · {corretor.creci}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ fontSize: 12, color: '#6b655b' }}>feito com</span>
            <Link to="/">
              <img src="/assets/logo-cream.png" style={{ height: 20, opacity: 0.8, cursor: 'pointer', display: 'block' }} alt="CAVI" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
