import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../store.jsx';
import { colors, fonts } from '../theme.js';
import { fmtPreco, statusImovelStyle } from '../lib/format.js';
import Badge from '../components/Badge.jsx';

export default function Properties() {
  const navigate = useNavigate();
  const { broker, imoveisDoCorretor, togglePublicacao } = useData();
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('Todos');

  const todos = imoveisDoCorretor(broker.id);
  const total = todos.length;
  const publicados = todos.filter((i) => i.status === 'Publicado').length;

  const q = busca.trim().toLowerCase();
  const lista = todos.filter((i) => {
    const okBusca = !q || [i.titulo, i.codigo, i.bairro].some((v) => v.toLowerCase().includes(q));
    const okStatus =
      statusFiltro === 'Todos' ||
      (statusFiltro === 'Publicados' && i.status === 'Publicado') ||
      (statusFiltro === 'Ocultos' && i.status === 'Oculto');
    return okBusca && okStatus;
  });

  const cols = '3fr 1.3fr 1.4fr 1fr 1.6fr';
  const btn = { padding: '8px 13px', border: `1px solid ${colors.field}`, background: '#fff', borderRadius: 9, fontSize: 13, fontWeight: 600, color: colors.muted, cursor: 'pointer' };

  return (
    <div style={{ padding: '34px 44px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 26 }}>
        <div>
          <h1 style={{ fontFamily: fonts.display, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: '0 0 4px' }}>Meus imóveis</h1>
          <div style={{ fontSize: 14, color: colors.mutedSoft }}>{total} imóveis · {publicados} publicados</div>
        </div>
        <button onClick={() => navigate('/app/imoveis/novo')} style={{ background: colors.orange, color: '#fff', border: 'none', borderRadius: 11, padding: '13px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
          + Novo imóvel
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: colors.faint }}>⌕</span>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, código ou bairro"
            style={{ width: '100%', padding: '12px 14px 12px 38px', border: `1px solid ${colors.field}`, borderRadius: 10, fontSize: 15, background: '#fff' }}
          />
        </div>
        <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} style={{ padding: '12px 14px', border: `1px solid ${colors.field}`, borderRadius: 10, fontSize: 15, background: '#fff', color: colors.ink, cursor: 'pointer' }}>
          <option>Todos</option>
          <option>Publicados</option>
          <option>Ocultos</option>
        </select>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 16, padding: '14px 22px', background: colors.bg, borderBottom: `1px solid ${colors.border}`, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.faint }}>
          <div>Imóvel</div><div>Tipo</div><div>Preço</div><div>Status</div><div style={{ textAlign: 'right' }}>Ações</div>
        </div>
        {lista.map((im) => {
          const st = statusImovelStyle(im.status);
          return (
            <div key={im.id} style={{ display: 'grid', gridTemplateColumns: cols, gap: 16, padding: '14px 22px', alignItems: 'center', borderBottom: '1px solid #f4f0e7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                <img src={im.foto} style={{ width: 66, height: 50, objectFit: 'cover', borderRadius: 8, flex: 'none' }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{im.titulo}</div>
                  <div style={{ fontSize: 12, color: colors.faint }}>{im.codigo} · {im.bairro}</div>
                </div>
              </div>
              <div style={{ fontSize: 14, color: colors.muted }}>{im.tipo}<div style={{ fontSize: 12, color: colors.faint }}>{im.finalidade}</div></div>
              <div style={{ fontWeight: 700, fontSize: 15, color: colors.ink }}>{fmtPreco(im.preco, im.finalidade)}</div>
              <div><Badge cor={st.cor} bg={st.bg}>{im.status}</Badge></div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => navigate(`/app/imoveis/${im.id}/editar`)} style={btn}>Editar</button>
                <button onClick={() => togglePublicacao(im.id)} style={btn}>{im.status === 'Publicado' ? 'Ocultar' : 'Publicar'}</button>
                <button onClick={() => navigate(`/v/${broker.slug}/imovel/${im.id}`)} style={{ padding: '8px 13px', border: 'none', background: colors.bg, borderRadius: 9, fontSize: 13, fontWeight: 600, color: colors.orange, cursor: 'pointer' }}>Ver</button>
              </div>
            </div>
          );
        })}
        {!lista.length && (
          <div style={{ padding: '40px 22px', textAlign: 'center', color: colors.mutedSoft }}>Nenhum imóvel encontrado.</div>
        )}
      </div>
    </div>
  );
}
