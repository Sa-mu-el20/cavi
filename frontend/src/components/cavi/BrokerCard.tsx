import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { colors, fonts } from '../../lib/theme'
import type { CorretorVitrine } from '../../lib/types'
import Avatar from './Avatar'

interface BrokerCardProps {
  corretor: CorretorVitrine
}

// Cartão de corretor (vitrines no ar, na home pública).
// Porte de cavi-react/src/components/BrokerCard.jsx.
export default function BrokerCard({ corretor }: BrokerCardProps) {
  const navigate = useNavigate()
  const [hover, setHover] = useState(false)
  const local = [corretor.bairro, corretor.cidade].filter(Boolean).join(', ') || corretor.uf || '—'

  return (
    <div
      onClick={() => navigate(`/v/${corretor.slug}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff',
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        padding: 26,
        cursor: 'pointer',
        transition: 'box-shadow .15s, transform .15s',
        boxShadow: hover ? '0 18px 40px -22px rgba(60,45,25,0.30)' : 'none',
        transform: hover ? 'translateY(-3px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <Avatar corretor={corretor} size={48} radius={12} fontSize={21} />
        <div>
          <div style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 19, lineHeight: 1.2 }}>
            {corretor.nome_publico}
          </div>
          {corretor.creci && (
            <div style={{ fontSize: 13, color: colors.mutedSoft }}>{corretor.creci}</div>
          )}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 18,
          borderTop: `1px solid ${colors.borderSoft}`,
        }}
      >
        <div style={{ fontSize: 14, color: colors.muted }}>{local}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: colors.orange }}>
          {corretor.qtd_imoveis_publicados} imóveis
        </div>
      </div>
    </div>
  )
}
