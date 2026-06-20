// Recuperação de senha na estética CAVI (painel split, porte de
// design/cavi-react/src/pages/ForgotPassword.jsx). Mantém o fluxo real:
// POST /api/esqueci-senha com mensagem genérica por privacidade.
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import type { MensagemResponse } from '../../lib/types'
import { esqueciSenhaSchema } from '../../lib/schemas'
import { colors, fonts } from '../../lib/theme'

const MENSAGEM_GENERICA =
  'Se o e-mail informado estiver cadastrado, enviaremos um link para redefinição de senha. Verifique sua caixa de entrada.'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [erros, setErros] = useState<Record<string, string[]>>({})
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function aoEnviar(e: FormEvent) {
    e.preventDefault()
    setErros({})

    const parsed = esqueciSenhaSchema.safeParse({ email })
    if (!parsed.success) {
      setErros(parsed.error.flatten().fieldErrors)
      return
    }

    setEnviando(true)
    try {
      await api.post<MensagemResponse>('/esqueci-senha', parsed.data)
      setEnviado(true)
    } catch (err) {
      // Por privacidade, mostramos a mensagem genérica mesmo em caso de erro,
      // exceto quando o backend devolve erro de validação por campo.
      if (err instanceof ApiError && err.errors) setErros(err.errors)
      else setEnviado(true)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', fontFamily: fonts.body, background: colors.bg }}>
      {/* painel escuro */}
      <div
        style={{
          background: colors.ink,
          padding: 56,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 30% 80%, rgba(217,122,43,0.20), transparent 50%)',
          }}
        />
        <Link to="/" style={{ position: 'relative', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/assets/logo-icon-cream.svg" alt="" style={{ height: 34, display: 'block' }} />
          <img src="/assets/logo-name-cream.svg" alt="CAVI" style={{ height: 24, display: 'block' }} />
        </Link>
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontFamily: fonts.display, fontWeight: 300, fontSize: 40, color: colors.bg, lineHeight: 1.1, margin: '0 0 20px', letterSpacing: -0.5 }}>
            Sem acesso? A gente te coloca de volta.
          </h2>
          <p style={{ fontSize: 16, color: '#cfc7b9', lineHeight: 1.6, margin: 0, maxWidth: 420 }}>
            Enviamos um link seguro para o seu e-mail. Você define uma nova senha e volta direto
            para o painel — seu catálogo continua no ar o tempo todo.
          </p>
        </div>
        <div style={{ position: 'relative', fontSize: 13, color: '#7d766a' }}>
          O link expira em 30 minutos por segurança.
        </div>
      </div>

      {/* conteúdo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {!enviado ? (
            <form onSubmit={aoEnviar} noValidate>
              <h1 style={{ fontFamily: fonts.display, fontWeight: 400, fontSize: 28, margin: '0 0 6px' }}>
                Recuperar senha
              </h1>
              <p style={{ fontSize: 15, color: colors.muted, margin: '0 0 26px' }}>
                Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha.
              </p>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.muted, marginBottom: 6 }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '13px 14px',
                  border: `1px solid ${erros.email ? '#c0392b' : colors.field}`,
                  borderRadius: 10,
                  fontSize: 15,
                  background: '#fff',
                }}
              />
              {erros.email?.[0] && (
                <span style={{ display: 'block', fontSize: 12, color: '#c0392b', marginTop: 4 }}>
                  {erros.email[0]}
                </span>
              )}
              <button type="submit" disabled={enviando} style={botaoPrimario(enviando)}>
                {enviando ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
              <Link to="/login" style={voltarLink}>
                ← Voltar para o login
              </Link>
            </form>
          ) : (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    flex: '0 0 52px',
                    borderRadius: 14,
                    background: '#e6eed6',
                    color: colors.greenText,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                  }}
                >
                  ✓
                </div>
                <h1 style={{ fontFamily: fonts.display, fontWeight: 400, fontSize: 28, lineHeight: 1.2, margin: 0 }}>
                  Verifique seu e-mail
                </h1>
              </div>
              <p style={{ fontSize: 15, color: colors.muted, lineHeight: 1.6, margin: '0 0 26px' }}>
                {MENSAGEM_GENERICA}
              </p>
              <Link to="/login" style={{ ...botaoPrimario(false), display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 0 }}>
                Voltar para o login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function botaoPrimario(carregando: boolean): React.CSSProperties {
  return {
    width: '100%',
    marginTop: 24,
    background: colors.orange,
    color: '#fff',
    border: 'none',
    borderRadius: 11,
    padding: 15,
    fontWeight: 600,
    fontSize: 16,
    cursor: carregando ? 'wait' : 'pointer',
    opacity: carregando ? 0.7 : 1,
  }
}

const voltarLink: React.CSSProperties = {
  display: 'block',
  textAlign: 'center',
  marginTop: 18,
  fontSize: 14,
  color: colors.mutedSoft,
  textDecoration: 'none',
}
