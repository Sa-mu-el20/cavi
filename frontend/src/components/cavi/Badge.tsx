import type { CSSProperties, ReactNode } from 'react'

// Pílula colorida usada para finalidade, status e plano.
// Porte de cavi-react/src/components/Badge.jsx.
interface BadgeProps {
  children: ReactNode
  cor: string
  bg: string
  style?: CSSProperties
}

export default function Badge({ children, cor, bg, style }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 12,
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: 999,
        color: cor,
        background: bg,
        ...style,
      }}
    >
      {children}
    </span>
  )
}
