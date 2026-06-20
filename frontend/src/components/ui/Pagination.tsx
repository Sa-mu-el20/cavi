import type { CSSProperties } from 'react'
import { colors, fonts } from '../../lib/theme'

// Paginação na estética CAVI (CSS-in-JS, sem Bootstrap). Glyphs ← →.
export default function Pagination({
  pagina,
  totalPaginas,
  onPagina,
}: {
  pagina: number
  totalPaginas: number
  onPagina: (p: number) => void
}) {
  if (totalPaginas <= 1) return null

  const paginas: number[] = []
  const inicio = Math.max(1, pagina - 2)
  const fim = Math.min(totalPaginas, pagina + 2)
  for (let i = inicio; i <= fim; i++) paginas.push(i)

  const base: CSSProperties = {
    minWidth: 38,
    height: 38,
    padding: '0 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: 9,
    background: '#fff',
    color: colors.ink,
    fontSize: 14,
    fontWeight: 600,
    fontFamily: fonts.body,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  }

  const ativo: CSSProperties = {
    ...base,
    background: colors.orange,
    borderColor: colors.orange,
    color: '#fff',
    cursor: 'default',
  }

  function desabilitado(d: boolean): CSSProperties {
    return d ? { opacity: 0.45, cursor: 'not-allowed' } : {}
  }

  const reticencias: CSSProperties = {
    minWidth: 24,
    textAlign: 'center',
    color: colors.faint,
    alignSelf: 'center',
  }

  return (
    <nav
      aria-label="Paginação"
      style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}
    >
      <button
        onClick={() => onPagina(pagina - 1)}
        disabled={pagina <= 1}
        style={{ ...base, ...desabilitado(pagina <= 1) }}
      >
        <span aria-hidden>←</span> Anterior
      </button>

      {inicio > 1 && (
        <button onClick={() => onPagina(1)} style={base}>
          1
        </button>
      )}
      {inicio > 2 && <span style={reticencias}>…</span>}

      {paginas.map((p) => (
        <button
          key={p}
          onClick={() => onPagina(p)}
          disabled={p === pagina}
          style={p === pagina ? ativo : base}
          aria-current={p === pagina ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      {fim < totalPaginas - 1 && <span style={reticencias}>…</span>}
      {fim < totalPaginas && (
        <button onClick={() => onPagina(totalPaginas)} style={base}>
          {totalPaginas}
        </button>
      )}

      <button
        onClick={() => onPagina(pagina + 1)}
        disabled={pagina >= totalPaginas}
        style={{ ...base, ...desabilitado(pagina >= totalPaginas) }}
      >
        Próxima <span aria-hidden>→</span>
      </button>
    </nav>
  )
}
