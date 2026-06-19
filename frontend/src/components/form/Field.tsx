// Campos de formulário reutilizáveis na estética CAVI (CSS-in-JS puro,
// tokens de theme.ts). Mesma API dos componentes Bootstrap anteriores:
// TextField / TextAreaField / SelectField / SubmitButton.
import type { ChangeEvent, CSSProperties, ReactNode } from 'react'
import { colors, fonts } from '../../lib/theme'

interface BaseProps {
  label: string
  name: string
  erro?: string
  ajuda?: string
  obrigatorio?: boolean
  disabled?: boolean
  icon?: string
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: colors.muted,
  marginBottom: 6,
}

function campoStyle(erro?: string, disabled?: boolean): CSSProperties {
  return {
    width: '100%',
    padding: '13px 14px',
    border: `1px solid ${erro ? '#c0392b' : colors.field}`,
    borderRadius: 10,
    fontSize: 15,
    background: disabled ? colors.cream : '#fff',
    color: colors.ink,
    fontFamily: fonts.body,
  }
}

function Rotulo({ label, name, obrigatorio }: { label: string; name: string; obrigatorio?: boolean }) {
  return (
    <label htmlFor={name} style={labelStyle}>
      {label}
      {obrigatorio && <span style={{ color: '#c0392b' }}> *</span>}
    </label>
  )
}

function Feedback({ erro, ajuda }: { erro?: string; ajuda?: string }) {
  if (erro) {
    return (
      <span style={{ display: 'block', fontSize: 12, color: '#c0392b', marginTop: 4 }}>{erro}</span>
    )
  }
  if (ajuda) {
    return (
      <span style={{ display: 'block', fontSize: 12, color: colors.mutedSoft, marginTop: 4 }}>
        {ajuda}
      </span>
    )
  }
  return null
}

interface TextFieldProps extends BaseProps {
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel'
  placeholder?: string
  autoComplete?: string
  maxLength?: number
}

export function TextField({
  label,
  name,
  value,
  onChange,
  erro,
  ajuda,
  obrigatorio,
  disabled,
  icon,
  type = 'text',
  placeholder,
  autoComplete,
  maxLength,
}: TextFieldProps) {
  const input = (
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      maxLength={maxLength}
      disabled={disabled}
      style={{
        ...campoStyle(erro, disabled),
        ...(icon ? { paddingLeft: 40 } : null),
      }}
    />
  )
  return (
    <div style={{ marginBottom: 16 }}>
      <Rotulo label={label} name={name} obrigatorio={obrigatorio} />
      {icon ? (
        <div style={{ position: 'relative' }}>
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.faint,
              fontSize: 15,
              pointerEvents: 'none',
            }}
          >
            {icon}
          </span>
          {input}
        </div>
      ) : (
        input
      )}
      <Feedback erro={erro} ajuda={ajuda} />
    </div>
  )
}

interface TextAreaProps extends BaseProps {
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
  maxLength?: number
}

export function TextAreaField({
  label,
  name,
  value,
  onChange,
  erro,
  ajuda,
  obrigatorio,
  disabled,
  rows = 4,
  placeholder,
  maxLength,
}: TextAreaProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Rotulo label={label} name={name} obrigatorio={obrigatorio} />
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        style={{ ...campoStyle(erro, disabled), resize: 'vertical' }}
      />
      <Feedback erro={erro} ajuda={ajuda} />
    </div>
  )
}

interface SelectProps extends BaseProps {
  value: string
  onChange: (v: string) => void
  opcoes: { valor: string; rotulo: string }[]
  placeholder?: string
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  erro,
  ajuda,
  obrigatorio,
  disabled,
  opcoes,
  placeholder,
}: SelectProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Rotulo label={label} name={name} obrigatorio={obrigatorio} />
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={campoStyle(erro, disabled)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
      <Feedback erro={erro} ajuda={ajuda} />
    </div>
  )
}

// Botão de submit com estado de carregamento padronizado (estética CAVI).
export function SubmitButton({
  carregando,
  children,
  icon,
  style,
}: {
  carregando?: boolean
  children: ReactNode
  /** Glyph unicode opcional exibido antes do texto. */
  icon?: string
  /** Sobrescreve/estende o estilo padrão do botão. */
  style?: CSSProperties
}) {
  return (
    <button
      type="submit"
      disabled={carregando}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: colors.orange,
        color: '#fff',
        border: 'none',
        borderRadius: 11,
        padding: '14px 18px',
        fontWeight: 600,
        fontSize: 16,
        fontFamily: fonts.body,
        cursor: carregando ? 'wait' : 'pointer',
        opacity: carregando ? 0.7 : 1,
        ...style,
      }}
    >
      {carregando ? <Spinner inline /> : icon && <span aria-hidden>{icon}</span>}
      {children}
    </button>
  )
}

// Spinner inline pequeno (sem Bootstrap), usado no SubmitButton.
function Spinner({ inline }: { inline?: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: inline ? 15 : 22,
        height: inline ? 15 : 22,
        border: '2px solid rgba(255,255,255,0.45)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'cavi-spin 0.7s linear infinite',
      }}
    />
  )
}
