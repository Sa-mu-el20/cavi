// Redefinição de senha na estética CAVI (painel split). Mantém o fluxo real:
// token via query string + POST /api/redefinir-senha.
import { useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import type { MensagemResponse } from '../../lib/types'
import { toast } from '../../store/uiStore'
import { redefinirSenhaSchema } from '../../lib/schemas'
import { colors, fonts } from '../../lib/theme'

export default function RedefinirSenhaPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erros, setErros] = useState<Record<string, string[]>>({})
  const [enviando, setEnviando] = useState(false)

  async function aoEnviar(e: FormEvent) {
    e.preventDefault()
    setErros({})

    const parsed = redefinirSenhaSchema.safeParse({
      senha,
      confirmar_senha: confirmarSenha,
    })
    if (!parsed.success) {
      setErros(parsed.error.flatten().fieldErrors)
      return
    }

    setEnviando(true)
    try {
      await api.post<MensagemResponse>('/redefinir-senha', { token, ...parsed.data })
      toast.sucesso('Senha redefinida com sucesso! Faça login com a nova senha.')
      navigate('/login', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.errors) setErros(err.errors)
      // Token inválido/expirado chega como 400 (detail string, errors=null):
      // direciona ao alerta dedicado de token em vez de cair em toast.
      else if (err instanceof ApiError && err.status === 400) setErros({ token: [err.message] })
      else toast.erro(err instanceof Error ? err.message : 'Falha ao redefinir a senha.')
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
            Defina uma nova senha e volte ao painel.
          </h2>
          <p style={{ fontSize: 16, color: '#cfc7b9', lineHeight: 1.6, margin: 0, maxWidth: 420 }}>
            Escolha uma senha forte. Seu catálogo permanece no ar enquanto você atualiza o acesso.
          </p>
        </div>
        <div style={{ position: 'relative', fontSize: 13, color: '#7d766a' }}>
          Por segurança, o link de redefinição é de uso único.
        </div>
      </div>

      {/* conteúdo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h1 style={{ fontFamily: fonts.display, fontWeight: 400, fontSize: 28, margin: '0 0 6px' }}>
            Redefinir senha
          </h1>

          {erros.geral?.[0] && <Aviso tipo="erro">{erros.geral[0]}</Aviso>}

          {token ? (
            <form onSubmit={aoEnviar} noValidate>
              <p style={{ fontSize: 15, color: colors.muted, margin: '0 0 26px' }}>
                Digite sua nova senha abaixo.
              </p>

              {erros.token?.[0] && <Aviso tipo="erro">{erros.token[0]}</Aviso>}

              <Campo
                label="Nova senha"
                type="password"
                value={senha}
                onChange={setSenha}
                erro={erros.senha?.[0]}
                autoComplete="new-password"
              />
              <Campo
                label="Confirmar nova senha"
                type="password"
                value={confirmarSenha}
                onChange={setConfirmarSenha}
                erro={erros.confirmar_senha?.[0]}
                autoComplete="new-password"
              />

              <div
                style={{
                  background: colors.cream,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                  margin: '4px 0 0',
                  fontSize: 13,
                  color: colors.muted,
                }}
              >
                <strong style={{ color: colors.ink }}>Requisitos da senha:</strong>
                <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                  <li>Mínimo de 8 caracteres</li>
                  <li>Pelo menos 1 letra maiúscula</li>
                  <li>Pelo menos 1 letra minúscula</li>
                  <li>Pelo menos 1 número</li>
                  <li>Pelo menos 1 caractere especial (ex: !@#$%)</li>
                </ul>
              </div>

              <button type="submit" disabled={enviando} style={botaoPrimario(enviando)}>
                {enviando ? 'Salvando...' : 'Redefinir senha'}
              </button>
            </form>
          ) : (
            <>
              <Aviso tipo="erro">
                Link de redefinição inválido ou expirado. Solicite um novo link de recuperação.
              </Aviso>
              <Link to="/esqueci-senha" style={{ ...botaoPrimario(false), display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Solicitar novo link
              </Link>
            </>
          )}

          <Link to="/login" style={voltarLink}>
            ← Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
}

function Campo({
  label,
  type,
  value,
  onChange,
  erro,
  autoComplete,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  erro?: string
  autoComplete?: string
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.muted, marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder="••••••••"
        style={{
          width: '100%',
          padding: '13px 14px',
          border: `1px solid ${erro ? '#c0392b' : colors.field}`,
          borderRadius: 10,
          fontSize: 15,
          background: '#fff',
        }}
      />
      {erro && (
        <span style={{ display: 'block', fontSize: 12, color: '#c0392b', marginTop: 4 }}>{erro}</span>
      )}
    </div>
  )
}

function Aviso({ tipo, children }: { tipo: 'erro'; children: React.ReactNode }) {
  return (
    <div
      role="alert"
      style={{
        background: tipo === 'erro' ? '#fbeae8' : colors.cream,
        border: `1px solid ${tipo === 'erro' ? '#e3b4ad' : colors.border}`,
        color: tipo === 'erro' ? '#9c2c1f' : colors.muted,
        borderRadius: 12,
        padding: '12px 14px',
        fontSize: 14,
        margin: '0 0 18px',
      }}
    >
      {children}
    </div>
  )
}

function botaoPrimario(carregando: boolean): CSSProperties {
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

const voltarLink: CSSProperties = {
  display: 'block',
  textAlign: 'center',
  marginTop: 18,
  fontSize: 14,
  color: colors.mutedSoft,
  textDecoration: 'none',
}
