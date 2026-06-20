import { colors, fonts } from '../../lib/theme'

// Indicador de carregamento centralizado (estética CAVI, sem Bootstrap).
export default function Spinner({ texto = 'Carregando...' }: { texto?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0', fontFamily: fonts.body }}>
      <span
        role="status"
        aria-label={texto}
        style={{
          display: 'inline-block',
          width: 38,
          height: 38,
          border: `3px solid ${colors.border}`,
          borderTopColor: colors.orange,
          borderRadius: '50%',
          animation: 'cavi-spin 0.7s linear infinite',
        }}
      />
      {texto && (
        <p style={{ color: colors.mutedSoft, marginTop: 12, marginBottom: 0, fontSize: 14 }}>
          {texto}
        </p>
      )}
    </div>
  )
}
