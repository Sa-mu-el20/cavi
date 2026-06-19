import { useNavigate } from 'react-router';
import { useData } from '../store.jsx';
import { colors, fonts } from '../theme.js';
import { fmtPreco, statusImovelStyle } from '../lib/format.js';
import StatCard from '../components/StatCard.jsx';
import Badge from '../components/Badge.jsx';

export default function Dashboard() {
  const navigate = useNavigate();
  const { broker, imoveisDoCorretor } = useData();
  const imoveis = imoveisDoCorretor(broker.id);

  const total = imoveis.length;
  const publicados = imoveis.filter((i) => i.status === 'Publicado').length;
  const ocultos = total - publicados;
  const acessos = imoveis.reduce((a, i) => a + i.acessos, 0);
  const contatos = imoveis.reduce((a, i) => a + i.contatos, 0);
  const recentes = imoveis.slice(0, 4);

  const atalho = (icon, label, onClick) => (
    <div
      key={label}
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 13, border: `1px solid ${colors.borderSoft}`, borderRadius: 11, cursor: 'pointer', fontWeight: 600, fontSize: 15 }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.orange)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.borderSoft)}
    >
      <span style={{ color: colors.orange, fontSize: 18 }}>{icon}</span> {label}
    </div>
  );

  return (
    <div style={{ padding: '34px 44px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 30 }}>
        <div>
          <div style={{ fontSize: 14, color: colors.mutedSoft, marginBottom: 4 }}>Bom dia, {broker.nome.split(' ')[0]} 👋</div>
          <h1 style={{ fontFamily: fonts.display, fontWeight: 400, fontSize: 32, lineHeight: 1.1, margin: 0 }}>Painel</h1>
        </div>
        <button onClick={() => navigate('/app/imoveis/novo')} style={{ background: colors.orange, color: '#fff', border: 'none', borderRadius: 11, padding: '13px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
          + Novo imóvel
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard label="Imóveis" value={total} />
        <StatCard label="Publicados" value={publicados} valueColor={colors.greenText} />
        <StatCard label="Ocultos" value={ocultos} valueColor="#a89f90" />
        <StatCard label="Contatos no WhatsApp" value={contatos} dark />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
        <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 20, margin: 0 }}>Imóveis recentes</h2>
            <span style={{ fontSize: 14, color: colors.orange, cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/app/imoveis')}>Ver todos →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recentes.map((im) => {
              const st = statusImovelStyle(im.status);
              return (
                <div
                  key={im.id}
                  onClick={() => navigate(`/v/${broker.slug}/imovel/${im.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 12, borderRadius: 12, cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = colors.bg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <img src={im.foto} style={{ width: 62, height: 48, objectFit: 'cover', borderRadius: 8, flex: 'none' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{im.titulo}</div>
                    <div style={{ fontSize: 13, color: colors.mutedSoft }}>{fmtPreco(im.preco, im.finalidade)} · {im.bairro}</div>
                  </div>
                  <Badge cor={st.cor} bg={st.bg} style={{ flex: 'none' }}>{im.status}</Badge>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 20, margin: '0 0 16px' }}>Atalhos</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {atalho('＋', 'Cadastrar imóvel', () => navigate('/app/imoveis/novo'))}
              {atalho('⚙', 'Configurar meu site', () => navigate('/app/config'))}
              {atalho('↗', 'Ver meu catálogo', () => navigate(`/v/${broker.slug}`))}
            </div>
          </div>
          <div style={{ background: '#e6eed6', border: '1px solid #d6e2c0', borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 14, color: colors.greenText, fontWeight: 600, marginBottom: 8 }}>Total de acessos</div>
            <div style={{ fontFamily: fonts.display, fontSize: 38, fontWeight: 500, lineHeight: 1, color: colors.ink }}>{acessos}</div>
            <div style={{ fontSize: 13, color: '#6f7d56', marginTop: 8 }}>visitas aos seus imóveis nos últimos 30 dias</div>
          </div>
        </div>
      </div>
    </div>
  );
}
