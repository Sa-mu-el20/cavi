import type { ReactNode } from 'react'
import { colors, fonts } from '../../lib/theme'

// Cartão de número usado nos painéis (claro por padrão, escuro com dark).
// Porte de cavi-react/src/components/StatCard.jsx.
interface StatCardProps {
  label: string
  value: ReactNode
  valueColor?: string
  dark?: boolean
  hint?: ReactNode
}

export default function StatCard({ label, value, valueColor, dark = false, hint }: StatCardProps) {
  return (
    <div
      style={{
        background: dark ? colors.ink : '#fff',
        border: `1px solid ${dark ? colors.ink : colors.border}`,
        borderRadius: 16,
        padding: 24,
      }}
    >
      <div style={{ fontSize: 14, color: dark ? '#bcb4a6' : colors.mutedSoft, marginBottom: 10 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: fonts.display,
          fontSize: 38,
          fontWeight: 500,
          lineHeight: 1,
          color: valueColor || (dark ? '#fff' : colors.ink),
        }}
      >
        {value}
      </div>
      {hint && <div style={{ fontSize: 13, color: colors.muted, marginTop: 8 }}>{hint}</div>}
    </div>
  )
}
