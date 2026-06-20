import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { colors, fonts } from '../../lib/theme'
import { formatarPrecoImovel, urlMidia } from '../../lib/format'
import { FinalidadeImovel, TipoImovel } from '../../lib/types'
import type { ImovelResumo } from '../../lib/types'
import Badge from './Badge'

// Estilo de pílula por finalidade (presentation-only). Porte de finalidadeStyle.
function finalidadeStyle(finalidade: string): { cor: string; bg: string } {
  return finalidade === FinalidadeImovel.VENDA
    ? { cor: '#d97a2b', bg: '#fbeedd' }
    : { cor: '#5a8f7b', bg: '#e2efe6' }
}

interface PropertyCardProps {
  imovel: ImovelResumo
  slug: string
}

// Cartão de imóvel do catálogo público. Porte de cavi-react/src/components/PropertyCard.jsx.
export default function PropertyCard({ imovel, slug }: PropertyCardProps) {
  const navigate = useNavigate()
  const [hover, setHover] = useState(false)
  const fin = finalidadeStyle(imovel.finalidade)
  const ehComercial =
    imovel.tipo === TipoImovel.SALA_COMERCIAL || imovel.tipo === TipoImovel.TERRENO

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
      <div style={{ position: 'relative', background: colors.cream }}>
        {imovel.foto_principal ? (
          <img
            src={urlMidia(imovel.foto_principal)}
            alt={imovel.titulo}
            style={{ width: '100%', height: 190, objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: 190,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.faint,
              fontSize: 13,
            }}
          >
            sem foto
          </div>
        )}
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
          {formatarPrecoImovel(imovel.preco, imovel.finalidade)}
        </div>
        <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.3, marginBottom: 8 }}>
          {imovel.titulo}
        </div>
        <div style={{ fontSize: 14, color: colors.mutedSoft, marginBottom: 14 }}>
          {[imovel.bairro, imovel.cidade].filter(Boolean).join(', ') || '—'}
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
          {ehComercial ? (
            <>
              <span>▭ {imovel.area ?? '—'}m²</span>
              <span>◇ {imovel.vagas ?? 0} vagas</span>
            </>
          ) : (
            <>
              <span>◴ {imovel.quartos ?? 0} quartos</span>
              <span>◇ {imovel.banheiros ?? 0} banh</span>
              <span>▭ {imovel.area ?? '—'}m²</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
