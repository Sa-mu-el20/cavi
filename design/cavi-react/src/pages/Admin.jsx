import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../store.jsx';
import { colors, fonts } from '../theme.js';
import { statusCorretorStyle, planoStyle } from '../lib/format.js';
import StatCard from '../components/StatCard.jsx';
import Avatar from '../components/Avatar.jsx';
import Badge from '../components/Badge.jsx';

export default function Admin() {
  const navigate = useNavigate();
  const { corretores, toggleCorretor } = useData();
  const [busca, setBusca] = useState('');
  const [plano, setPlano] = useState('Todos');

  const q = busca.trim().toLowerCase();
  const lista = corretores.filter((c) => {
    const okBusca = !q || [c.nome, c.site, c.cidade].some((v) => v.toLowerCase().includes(q));
    const okPlano = plano === 'Todos' || c.plano === plano;
    return okBusca && okPlano;
  });

  const total = corretores.length;
  const ativos = corretores.filter((c) => c.status === 'Ativo').length;
  const imoveis = corretores.reduce((a, c) => a + c.qtd, 0);
  const pro = corretores.filter((c) => c.plano === 'Pro').length;

  const cols = '2.4fr 1.4fr 1fr 0.9fr 1fr 1.4fr';

  return (
    <div style={{ padding: '34px 44px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: fonts.display, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: '0 0 4px' }}>Corretores cadastrados</h1>
        <div style={{ fontSize: 14, color: colors.mutedSoft }}>Acompanhe as contas criadas na plataforma.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 30 }}>
        <StatCard label="Corretores" value={total} />
        <StatCard label="Contas ativas" value={ativos} valueColor={colors.greenText} />
        <StatCard label="Imóveis publicados" value={imoveis} />
        <StatCard label="Assinantes Pro" value={pro} valueColor={colors.orangeDeep} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: colors.faint }}>⌕</span>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar corretor, site ou cidade"
            style={{ width: '100%', padding: '12px 14px 12px 38px', border: `1px solid ${colors.field}`, borderRadius: 10, fontSize: 15, background: '#fff' }}
          />
        </div>
        <select value={plano} onChange={(e) => setPlano(e.target.value)} style={{ padding: '12px 14px', border: `1px solid ${colors.field}`, borderRadius: 10, fontSize: 15, background: '#fff', color: colors.ink, cursor: 'pointer' }}>
          <option>Todos</option><option>Pro</option><option>Starter</option><option>Junior</option>
        </select>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 16, padding: '14px 22px', background: colors.bg, borderBottom: `1px solid ${colors.border}`, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.faint }}>
          <div>Site / Corretor</div><div>Cidade</div><div>Plano</div><div>Imóveis</div><div>Status</div><div style={{ textAlign: 'right' }}>Ação</div>
        </div>
        {lista.map((c) => {
          const st = statusCorretorStyle(c.status);
          const pl = planoStyle(c.plano);
          return (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: cols, gap: 16, padding: '14px 22px', alignItems: 'center', borderBottom: '1px solid #f4f0e7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, minWidth: 0 }}>
                <Avatar corretor={c} size={42} radius={10} fontSize={18} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.site}</div>
                  <div style={{ fontSize: 12, color: colors.faint }}>{c.nome} · {c.creci}</div>
                </div>
              </div>
              <div style={{ fontSize: 14, color: colors.muted }}>{c.cidade}<div style={{ fontSize: 12, color: colors.faint }}>desde {c.desde}</div></div>
              <div><Badge cor={pl.cor} bg={pl.bg}>{c.plano}</Badge></div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{c.qtd}</div>
              <div><Badge cor={st.cor} bg={st.bg}>{c.status}</Badge></div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => navigate(`/v/${c.slug}`)} style={{ padding: '8px 13px', border: `1px solid ${colors.field}`, background: '#fff', borderRadius: 9, fontSize: 13, fontWeight: 600, color: colors.muted, cursor: 'pointer' }}>Vitrine</button>
                <button onClick={() => toggleCorretor(c.id)} style={{ padding: '8px 13px', border: 'none', background: colors.bg, borderRadius: 9, fontSize: 13, fontWeight: 600, color: st.cor, cursor: 'pointer' }}>{c.status === 'Ativo' ? 'Desativar' : 'Ativar'}</button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 18, fontSize: 13, color: colors.faint, cursor: 'pointer' }} onClick={() => navigate('/')}>
        Voltar para a Home →
      </div>
    </div>
  );
}
