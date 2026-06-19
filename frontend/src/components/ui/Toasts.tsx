import { useEffect } from 'react'
import { useUIStore, type Toast, type ToastTipo } from '../../store/uiStore'
import { colors, fonts } from '../../lib/theme'

// Glyph + cor de fundo por tipo (estética CAVI, sem Bootstrap).
const ESTILO: Record<ToastTipo, { glyph: string; bg: string }> = {
  success: { glyph: '✓', bg: colors.greenText },
  danger: { glyph: '✕', bg: '#c0392b' },
  warning: { glyph: '!', bg: colors.orangeDeep },
  info: { glyph: 'i', bg: colors.ink },
}

function ToastItem({ toast }: { toast: Toast }) {
  const removerToast = useUIStore((s) => s.removerToast)
  useEffect(() => {
    const t = setTimeout(() => removerToast(toast.id), 5000)
    return () => clearTimeout(t)
  }, [toast.id, removerToast])

  const e = ESTILO[toast.tipo] ?? ESTILO.info

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: e.bg,
        color: '#fff',
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 10,
        minWidth: 280,
        maxWidth: 380,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        fontFamily: fonts.body,
        fontSize: 15,
      }}
    >
      <span
        aria-hidden
        style={{
          flex: 'none',
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.22)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {e.glyph}
      </span>
      <span style={{ flex: 1 }}>{toast.mensagem}</span>
      <button
        type="button"
        aria-label="Fechar"
        onClick={() => removerToast(toast.id)}
        style={{
          flex: 'none',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.8)',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
          padding: 2,
        }}
      >
        ✕
      </button>
    </div>
  )
}

// Container de toasts (bottom-right). Renderizado uma vez no RootGate.
export default function Toasts() {
  const toasts = useUIStore((s) => s.toasts)
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1090,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
