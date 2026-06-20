import type { ReactNode } from 'react'
import { colors, fonts } from '../../lib/theme'

// Estado vazio reutilizável (estética CAVI, sem Bootstrap).
// `icon` é um glyph unicode (ex.: ◳, ⚠, ⌂). Default neutro.
export default function EmptyState({
  icon = '◳',
  titulo,
  mensagem,
  children,
}: {
  icon?: string
  titulo: string
  mensagem?: string
  children?: ReactNode
}) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0', fontFamily: fonts.body }}>
      <div aria-hidden style={{ fontSize: 48, lineHeight: 1, color: colors.faint }}>
        {icon}
      </div>
      <h5
        style={{
          fontFamily: fonts.display,
          fontWeight: 500,
          fontSize: 20,
          color: colors.ink,
          margin: '16px 0 6px',
        }}
      >
        {titulo}
      </h5>
      {mensagem && (
        <p style={{ color: colors.muted, fontSize: 15, margin: '0 0 18px' }}>{mensagem}</p>
      )}
      {children}
    </div>
  )
}
