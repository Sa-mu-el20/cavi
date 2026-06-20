import { useState } from 'react';
import { useNavigate } from 'react-router';
import { colors, fonts } from '../theme.js';
import { fmtPreco, finalidadeStyle } from '../lib/format.js';
import Badge from './Badge.jsx';

// Cartão de imóvel do catálogo público.
export default function PropertyCard({ imovel, slug }) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const fin = finalidadeStyle(imovel.finalidade);

  return (
    <div
      onClick={() => navigate(`/v/${slug}/imovel/${imovel.id}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff',
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow .15s, transform .15s',
        boxShadow: hover ? '0 22px 44px -24px rgba(60,45,25,0.34)' : 'none',
        transform: hover ? 'translateY(-3px)' : 'none',
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={imovel.foto}
          alt={imovel.titulo}
          style={{ width: '100%', height: 190, objectFit: 'cover', display: 'block' }}
        />
        <Badge
          cor={fin.cor}
          bg={fin.bg}
          style={{ position: 'absolute', top: 14, left: 14, padding: '5px 11px' }}
        >
          {imovel.finalidade}
        </Badge>
      </div>
      <div style={{ padding: '18px 20px 20px' }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 23,
            color: colors.ink,
            marginBottom: 4,
          }}
        >
          {fmtPreco(imovel.preco, imovel.finalidade)}
        </div>
        <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.3, marginBottom: 8 }}>
          {imovel.titulo}
        </div>
        <div style={{ fontSize: 14, color: colors.mutedSoft, marginBottom: 14 }}>
          {imovel.bairro}, {imovel.cidade}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 14,
            paddingTop: 14,
            borderTop: `1px solid ${colors.borderSoft}`,
            fontSize: 13,
            color: colors.muted,
          }}
        >
          <span>◴ {imovel.quartos} quartos</span>
          <span>◇ {imovel.banheiros} banh</span>
          <span>▭ {imovel.area}m²</span>
        </div>
      </div>
    </div>
  );
}
