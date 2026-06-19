import type { CSSProperties } from 'react'
import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { colors, fonts } from '../../lib/theme'

// errorElement da rota raiz: isola crashes de render para que um erro em uma
// página não derrube o app inteiro (white screen).
export default function RouteError() {
  const error = useRouteError()

  let titulo = 'Algo deu errado'
  let detalhe = 'Ocorreu um erro inesperado ao renderizar esta página.'

  if (isRouteErrorResponse(error)) {
    titulo = `${error.status} ${error.statusText}`
    detalhe = typeof error.data === 'string' ? error.data : detalhe
  } else if (error instanceof Error) {
    detalhe = error.message
  }

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
      <div aria-hidden style={{ fontSize: 64, lineHeight: 1, color: colors.orange }}>
        ⚠
      </div>
      <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 28, margin: '18px 0 8px' }}>
        {titulo}
      </h2>
      <p style={{ color: colors.muted, fontSize: 16, margin: '0 0 28px', maxWidth: 480 }}>
        {detalhe}
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/" style={botaoPrimario}>
          <span aria-hidden>⌂</span> Início
        </Link>
        <button onClick={() => window.location.reload()} style={botaoSecundario}>
          Recarregar
        </button>
      </div>
    </div>
  )
}

const botaoPrimario: CSSProperties = {
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
}

const botaoSecundario: CSSProperties = {
  background: 'transparent',
  color: colors.muted,
  border: `1px solid ${colors.border}`,
  borderRadius: 10,
  padding: '12px 22px',
  fontWeight: 600,
  fontSize: 15,
  fontFamily: fonts.body,
  cursor: 'pointer',
}
