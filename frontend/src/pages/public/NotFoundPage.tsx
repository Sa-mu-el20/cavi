import { Link } from 'react-router-dom'
import { colors, fonts } from '../../lib/theme'

// Página 404 na estética CAVI (sem Bootstrap).
export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 40,
        background: colors.bg,
        fontFamily: fonts.body,
      }}
    >
      <div
        aria-hidden
        style={{
          fontFamily: fonts.display,
          fontWeight: 300,
          fontSize: 120,
          lineHeight: 1,
          color: colors.orange,
        }}
      >
        404
      </div>
      <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 28, margin: '12px 0 8px' }}>
        Página não encontrada
      </h2>
      <p style={{ color: colors.muted, fontSize: 16, margin: '0 0 28px', maxWidth: 460 }}>
        A página que você procura não existe ou foi movida.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: colors.orange,
          color: '#fff',
          borderRadius: 10,
          padding: '12px 22px',
          fontWeight: 600,
          fontSize: 15,
          textDecoration: 'none',
        }}
      >
        <span aria-hidden>⌂</span> Voltar ao início
      </Link>
    </div>
  )
}
