// Paleta e tokens visuais do CAVI — centralizados para reuso entre componentes.
// Porte de cavi-react/src/theme.js (fonte do design).

export const colors = {
  bg: '#faf8f3',
  ink: '#1f1b18',
  orange: '#d97a2b',
  orangeDeep: '#c06a22',
  green: '#9dc689',
  greenText: '#5a7d43',
  greenDark: '#1f3d18',
  muted: '#6f6a60',
  mutedSoft: '#948d80',
  faint: '#b3ab9d',
  border: '#ece7db',
  borderSoft: '#f0ebe0',
  field: '#e4ddcd',
  cream: '#f6f3ec',
} as const

export const fonts = {
  display: "'Jost', sans-serif",
  body: "'Hanken Grotesk', sans-serif",
} as const

export type ColorToken = keyof typeof colors
