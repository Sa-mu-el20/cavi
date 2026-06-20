import { useState } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router';
import { useData } from '../store.jsx';
import { colors, fonts } from '../theme.js';
import { fmtPreco, waLink, finalidadeStyle } from '../lib/format.js';
import Avatar from '../components/Avatar.jsx';
import Badge from '../components/Badge.jsx';

function StatBox({ label, value }) {
  return (
    <div style={{ background: colors.bg, border: `1px solid ${colors.borderSoft}`, borderRadius: 12, padding: 18 }}>
      <div style={{ fontSize: 13, color: colors.mutedSoft, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 500 }}>{value}</div>
    </div>
  );
}

export default function PropertyDetail() {
  const { id, slug } = useParams();
  const { corretor } = useOutletContext();
  const { imovel } = useData();
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);

  const im = imovel(id);
  if (!im) {
    return <div style={{ maxWidth: 1180, margin: '0 auto', padding: '60px 40px', color: colors.mutedSoft }}>Imóvel não encontrado.</div>;
  }

  const fin = finalidadeStyle(im.finalidade);
  const mainSrc = im.galeria[idx] || im.foto;
  const wa = waLink(corretor.whatsapp, `Olá! Tenho interesse no imóvel ${im.codigo} — ${im.titulo}`);

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 40px 0' }}>
      <div style={{ fontSize: 14, color: colors.mutedSoft, marginBottom: 20 }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/v/${slug}`)}>Imóveis</span>
        &nbsp;/&nbsp; <span style={{ color: colors.muted }}>{im.titulo}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 40, alignItems: 'start' }}>
        <div>
          <div style={{ borderRadius: 18, overflow: 'hidden', border: `1px solid ${colors.border}`, marginBottom: 14 }}>
            <img src={mainSrc} alt={im.titulo} style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {im.galeria.map((src, i) => (
              <img
                key={i}
                src={src}
                onClick={() => setIdx(i)}
                style={{ width: '100%', height: 84, objectFit: 'cover', borderRadius: 10, cursor: 'pointer', border: i === idx ? '2px solid #d97a2b' : '2px solid transparent', opacity: i === idx ? 1 : 0.7 }}
              />
            ))}
          </div>

          <div style={{ marginTop: 36 }}>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 24, margin: '0 0 14px' }}>Sobre o imóvel</h2>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: '#5b564d', margin: '0 0 28px' }}>{im.descricao}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              <StatBox label="Área" value={`${im.area}m²`} />
              <StatBox label="Quartos" value={im.quartos} />
              <StatBox label="Banheiros" value={im.banheiros} />
              <StatBox label="Vagas" value={im.vagas} />
            </div>
          </div>

          <div style={{ marginTop: 36 }}>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 24, margin: '0 0 14px' }}>Localização</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, color: '#5b564d', marginBottom: 16 }}>
              <span style={{ color: colors.orange }}>⚲</span> {im.logradouro}, {im.numero} — {im.bairro}, {im.cidade}/{im.uf}
            </div>
            <div style={{ height: 240, borderRadius: 14, border: `1px solid ${colors.border}`, backgroundImage: 'linear-gradient(#eee9dd 1px,transparent 1px),linear-gradient(90deg,#eee9dd 1px,transparent 1px)', backgroundSize: '34px 34px', backgroundColor: colors.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: colors.orange, boxShadow: '0 0 0 8px rgba(217,122,43,0.18)', position: 'absolute', left: '46%', top: '42%' }} />
              <span style={{ position: 'absolute', bottom: 14, right: 16, fontSize: 12, color: colors.faint }}>Mapa ilustrativo</span>
            </div>
          </div>
        </div>

        <aside style={{ position: 'sticky', top: 96 }}>
          <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 18, padding: 26, boxShadow: '0 16px 40px -26px rgba(60,45,25,0.35)' }}>
            <Badge cor={fin.cor} bg={fin.bg} style={{ padding: '5px 11px', marginBottom: 14 }}>{im.finalidade}</Badge>
            <div style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 34, letterSpacing: -0.5, marginBottom: 6 }}>{fmtPreco(im.preco, im.finalidade)}</div>
            <h1 style={{ fontWeight: 600, fontSize: 20, lineHeight: 1.35, margin: '0 0 6px' }}>{im.titulo}</h1>
            <div style={{ fontSize: 14, color: colors.mutedSoft, marginBottom: 8 }}>{im.bairro}, {im.cidade}</div>
            <div style={{ fontSize: 12, color: colors.faint, marginBottom: 22 }}>Código {im.codigo}</div>
            <a href={wa} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: colors.green, color: colors.greenDark, textDecoration: 'none', borderRadius: 12, padding: 15, fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
              Falar no WhatsApp
            </a>
            <button style={{ width: '100%', background: colors.ink, color: colors.bg, border: 'none', borderRadius: 12, padding: 15, fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
              Tenho interesse
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24, paddingTop: 22, borderTop: `1px solid ${colors.borderSoft}` }}>
              <Avatar corretor={corretor} size={46} radius={11} fontSize={19} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{corretor.nome}</div>
                <div style={{ fontSize: 13, color: colors.mutedSoft }}>{corretor.creci}</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
