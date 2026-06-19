import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { useData } from '../store.jsx';
import { colors, fonts } from '../theme.js';
import PropertyCard from '../components/PropertyCard.jsx';

const FILTROS_VAZIOS = { finalidade: '', tipo: '', bairro: '', precoMax: '' };

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{ flex: 1, minWidth: 140, padding: '12px 14px', border: `1px solid ${colors.field}`, borderRadius: 10, fontSize: 15, background: '#fff', color: colors.ink, cursor: 'pointer' }}
    >
      {children}
    </select>
  );
}

export default function Catalog() {
  const { corretor } = useOutletContext();
  const { imoveisDoCorretor } = useData();
  const [f, setF] = useState(FILTROS_VAZIOS);
  const set = (k) => (e) => setF((prev) => ({ ...prev, [k]: e.target.value }));

  const catalogo = imoveisDoCorretor(corretor.id, { somentePublicados: true }).filter(
    (i) =>
      (!f.finalidade || i.finalidade === f.finalidade) &&
      (!f.tipo || i.tipo === f.tipo) &&
      (!f.bairro || i.bairro === f.bairro) &&
      (!f.precoMax || i.preco <= Number(f.precoMax))
  );

  return (
    <>
      <section style={{ background: 'linear-gradient(180deg,#fff,#faf8f3)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '46px 40px 30px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.green, marginBottom: 12 }}>
            {corretor.bairro}, {corretor.cidade}
          </div>
          <h1 style={{ fontFamily: fonts.display, fontWeight: 300, fontSize: 44, margin: '0 0 14px', letterSpacing: -0.5, maxWidth: 680 }}>
            {corretor.sobre}
          </h1>
          <div style={{ fontSize: 15, color: colors.mutedSoft }}>{catalogo.length} imóveis disponíveis</div>
        </div>
      </section>

      {/* filtros */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 40px' }}>
        <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 8px 24px -18px rgba(60,45,25,0.30)' }}>
          <Select value={f.finalidade} onChange={set('finalidade')}>
            <option value="">Finalidade · todas</option>
            <option value="Venda">Venda</option>
            <option value="Aluguel">Aluguel</option>
          </Select>
          <Select value={f.tipo} onChange={set('tipo')}>
            <option value="">Tipo · todos</option>
            <option value="Apartamento">Apartamento</option>
            <option value="Casa">Casa</option>
            <option value="Cobertura">Cobertura</option>
            <option value="Studio">Studio</option>
            <option value="Loft">Loft</option>
            <option value="Sala comercial">Sala comercial</option>
          </Select>
          <Select value={f.bairro} onChange={set('bairro')}>
            <option value="">Bairro · todos</option>
            <option value="Pinheiros">Pinheiros</option>
            <option value="Vila Madalena">Vila Madalena</option>
            <option value="Alto de Pinheiros">Alto de Pinheiros</option>
            <option value="Itaim Bibi">Itaim Bibi</option>
          </Select>
          <Select value={f.precoMax} onChange={set('precoMax')}>
            <option value="">Preço máximo</option>
            <option value="600000">até R$ 600 mil</option>
            <option value="1000000">até R$ 1 mi</option>
            <option value="1500000">até R$ 1,5 mi</option>
            <option value="2000000">até R$ 2 mi</option>
          </Select>
          <button
            onClick={() => setF(FILTROS_VAZIOS)}
            style={{ padding: '12px 18px', border: `1px solid ${colors.field}`, background: colors.bg, borderRadius: 10, fontSize: 14, fontWeight: 600, color: colors.muted, cursor: 'pointer' }}
          >
            Limpar
          </button>
        </div>
      </div>

      {/* grade */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '30px 40px 0' }}>
        {catalogo.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {catalogo.map((im) => (
              <PropertyCard key={im.id} imovel={im} slug={corretor.slug} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: colors.mutedSoft, fontSize: 16 }}>
            Nenhum imóvel encontrado com esses filtros.
          </div>
        )}
      </div>
    </>
  );
}
