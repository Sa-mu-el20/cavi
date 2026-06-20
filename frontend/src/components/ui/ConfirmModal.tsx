import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useUIStore } from '../../store/uiStore'
import { colors, fonts } from '../../lib/theme'
import { overlay, dialog, titulo, iconCircle } from './AlertModal'

// Modal de confirmação global (estética CAVI, sem Bootstrap).
// Disparado por useUIStore().pedirConfirmacao({ mensagem, onConfirmar, ... }).
export default function ConfirmModal() {
  const confirm = useUIStore((s) => s.confirm)
  const fechar = useUIStore((s) => s.fecharConfirmacao)
  const [processando, setProcessando] = useState(false)

  if (!confirm) return null

  const tipo = confirm.tipo ?? 'danger'
  const cor = tipo === 'danger' ? '#c0392b' : colors.orangeDeep
  const glyph = tipo === 'danger' ? '✕' : '!'

  async function confirmar() {
    try {
      setProcessando(true)
      await confirm!.onConfirmar()
      fechar()
    } finally {
      setProcessando(false)
    }
  }

  const botaoSecundario: CSSProperties = {
    background: 'transparent',
    color: colors.muted,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: '11px 20px',
    fontWeight: 600,
    fontSize: 15,
    fontFamily: fonts.body,
    cursor: processando ? 'not-allowed' : 'pointer',
    opacity: processando ? 0.6 : 1,
  }

  const botaoConfirmar: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: cor,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '11px 20px',
    fontWeight: 600,
    fontSize: 15,
    fontFamily: fonts.body,
    cursor: processando ? 'wait' : 'pointer',
    opacity: processando ? 0.8 : 1,
  }

  return (
    <div style={overlay} onClick={processando ? undefined : fechar}>
      <div style={dialog} onClick={(ev) => ev.stopPropagation()} role="dialog" aria-modal>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span aria-hidden style={{ ...iconCircle, background: cor }}>
            {glyph}
          </span>
          <h5 style={titulo}>{confirm.titulo ?? 'Confirmar ação'}</h5>
        </div>
        <p style={{ color: colors.muted, fontSize: 15, margin: 0 }}>{confirm.mensagem}</p>
        {confirm.detalhes && (
          <p style={{ color: colors.mutedSoft, fontSize: 13, margin: '8px 0 0' }}>
            {confirm.detalhes}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button type="button" onClick={fechar} disabled={processando} style={botaoSecundario}>
            {confirm.textoCancelar ?? 'Cancelar'}
          </button>
          <button type="button" onClick={confirmar} disabled={processando} style={botaoConfirmar}>
            {processando && (
              <span
                aria-hidden
                style={{
                  display: 'inline-block',
                  width: 15,
                  height: 15,
                  border: '2px solid rgba(255,255,255,0.45)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'cavi-spin 0.7s linear infinite',
                }}
              />
            )}
            {confirm.textoConfirmar ?? 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
