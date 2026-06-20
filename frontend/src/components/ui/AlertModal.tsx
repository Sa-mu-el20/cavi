import type { CSSProperties } from 'react'
import { useUIStore } from '../../store/uiStore'
import { colors, fonts } from '../../lib/theme'

// Cor de destaque + glyph por tipo de alerta.
const ESTILO: Record<string, { glyph: string; cor: string }> = {
  danger: { glyph: '✕', cor: '#c0392b' },
  warning: { glyph: '!', cor: colors.orangeDeep },
  info: { glyph: 'i', cor: colors.ink },
  success: { glyph: '✓', cor: colors.greenText },
}

// Modal de alerta global (estética CAVI, sem Bootstrap).
export default function AlertModal() {
  const alert = useUIStore((s) => s.alert)
  const fechar = useUIStore((s) => s.fecharAlerta)
  if (!alert) return null

  const tipo = alert.tipo ?? 'info'
  const e = ESTILO[tipo] ?? ESTILO.info

  return (
    <div style={overlay} onClick={fechar}>
      <div style={dialog} onClick={(ev) => ev.stopPropagation()} role="dialog" aria-modal>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span aria-hidden style={{ ...iconCircle, background: e.cor }}>
            {e.glyph}
          </span>
          <h5 style={titulo}>{alert.titulo ?? 'Aviso'}</h5>
        </div>
        <p style={{ color: colors.muted, fontSize: 15, margin: 0 }}>{alert.mensagem}</p>
        {alert.detalhes && (
          <p style={{ color: colors.mutedSoft, fontSize: 13, margin: '8px 0 0' }}>
            {alert.detalhes}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
          <button type="button" onClick={fechar} style={botaoPrimario}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export const overlay: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(31,27,24,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  zIndex: 1080,
  fontFamily: fonts.body,
}

export const dialog: CSSProperties = {
  background: '#fff',
  borderRadius: 18,
  padding: 28,
  width: '100%',
  maxWidth: 460,
  boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
}

export const titulo: CSSProperties = {
  fontFamily: fonts.display,
  fontWeight: 500,
  fontSize: 20,
  color: colors.ink,
  margin: 0,
}

export const iconCircle: CSSProperties = {
  flex: 'none',
  width: 36,
  height: 36,
  borderRadius: '50%',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 16,
  fontWeight: 700,
}

export const botaoPrimario: CSSProperties = {
  background: colors.orange,
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '11px 20px',
  fontWeight: 600,
  fontSize: 15,
  fontFamily: fonts.body,
  cursor: 'pointer',
}
