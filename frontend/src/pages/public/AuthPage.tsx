// Página de autenticação (login + auto-cadastro de corretor) num único
// componente com alternância por abas. Porte fiel do design
// cavi-react/src/pages/Auth.jsx, ligado aos endpoints reais da API.
//
// - Login → POST /api/login (via authStore.login)
// - Cadastro de corretor → POST /api/cadastrar-corretor (api.post)
// Após login redireciona: Administrador → /admin, Corretor → /app.

import { useState } from 'react'
import type { CSSProperties, FormEvent, InputHTMLAttributes } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { toast } from '../../store/uiStore'
import { colors, fonts } from '../../lib/theme'
import { loginSchema, cadastroCorretorSchema } from '../../lib/schemas'
import { mascararCpf, mascararTelefone } from '../../lib/masks'
import { Perfil } from '../../lib/types'
import type { Usuario } from '../../lib/types'

interface LocationState {
  from?: string
}

type Erros = Record<string, string[]>

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  erro?: string
}

function Field({ label, erro, ...props }: FieldProps) {
  return (
    <div style={{ flex: 1 }}>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: colors.muted,
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <input
        {...props}
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
        <span style={{ display: 'block', fontSize: 12, color: '#c0392b', marginTop: 4 }}>
          {erro}
        </span>
      )}
    </div>
  )
}

/** Define o destino pós-login conforme o perfil do usuário. */
function destinoPorPerfil(usuario: Usuario): string {
  return usuario.perfil === Perfil.ADMIN ? '/admin' : '/app'
}

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const carregarSessao = useAuthStore((s) => s.carregarSessao)

  const [tab, setTab] = useState<'entrar' | 'cadastro'>('entrar')
  const cadastro = tab === 'cadastro'

  // Campos compartilhados
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  // Campos exclusivos do cadastro de corretor
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [creci, setCreci] = useState('')
  const [telefone, setTelefone] = useState('')
  const [nomePublico, setNomePublico] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')

  const [erros, setErros] = useState<Erros>({})
  const [enviando, setEnviando] = useState(false)

  function trocarTab(novo: 'entrar' | 'cadastro') {
    setTab(novo)
    setErros({})
  }

  async function aoEnviar(e: FormEvent) {
    e.preventDefault()
    setErros({})

    if (cadastro) {
      await submeterCadastro()
    } else {
      await submeterLogin()
    }
  }

  async function submeterLogin() {
    const parsed = loginSchema.safeParse({ email, senha })
    if (!parsed.success) {
      setErros(parsed.error.flatten().fieldErrors)
      return
    }

    setEnviando(true)
    try {
      const usuario = await login(parsed.data.email, parsed.data.senha)
      toast.sucesso('Login realizado com sucesso!')
      const explicito = (location.state as LocationState | null)?.from
      navigate(explicito ?? destinoPorPerfil(usuario), { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.errors) setErros(err.errors)
      else toast.erro(err instanceof Error ? err.message : 'Falha ao entrar.')
    } finally {
      setEnviando(false)
    }
  }

  async function submeterCadastro() {
    const dados = {
      nome,
      email,
      senha,
      cpf,
      telefone,
      creci,
      nome_publico: nomePublico,
      cidade,
      uf,
      whatsapp: telefone || undefined,
    }
    const parsed = cadastroCorretorSchema.safeParse(dados)
    if (!parsed.success) {
      setErros(parsed.error.flatten().fieldErrors)
      return
    }

    setEnviando(true)
    try {
      const usuario = await api.post<Usuario>('/cadastrar-corretor', parsed.data)
      // Cria a sessão automaticamente entrando logo após o cadastro.
      try {
        await login(parsed.data.email, parsed.data.senha)
      } catch {
        // Se o auto-login falhar, ainda assim atualiza a sessão conhecida.
        await carregarSessao()
      }
      toast.sucesso('Conta criada com sucesso! Bem-vindo à CAVI.')
      navigate(destinoPorPerfil(usuario), { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErros(err.errors)
        toast.erro(err.message || 'Confira os dados do cadastro.')
      } else {
        toast.erro(err instanceof Error ? err.message : 'Falha ao criar a conta.')
      }
    } finally {
      setEnviando(false)
    }
  }

  const tabBtn = (active: boolean): CSSProperties => ({
    flex: 1,
    border: 'none',
    cursor: 'pointer',
    padding: 11,
    borderRadius: 9,
    fontWeight: 600,
    fontSize: 15,
    background: active ? '#fff' : 'transparent',
    color: active ? colors.ink : colors.mutedSoft,
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
  })

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        fontFamily: fonts.body,
        background: colors.bg,
      }}
    >
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
            background:
              'radial-gradient(circle at 30% 80%, rgba(217,122,43,0.20), transparent 50%)',
          }}
        />
        <Link
          to="/"
          style={{
            position: 'relative',
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <img src="/assets/logo-icon-cream.svg" alt="" style={{ height: 34, display: 'block' }} />
          <img src="/assets/logo-name-cream.svg" alt="CAVI" style={{ height: 24, display: 'block' }} />
        </Link>
        <div style={{ position: 'relative' }}>
          <h2
            style={{
              fontFamily: fonts.display,
              fontWeight: 300,
              fontSize: 40,
              color: colors.bg,
              lineHeight: 1.1,
              margin: '0 0 20px',
              letterSpacing: -0.5,
            }}
          >
            Tudo o que você precisa para vender online.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28 }}>
            {[
              'Catálogo com seu nome e suas cores',
              'Imóveis ilimitados no plano Pro',
              'Contatos direto no WhatsApp',
            ].map((t) => (
              <div
                key={t}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: '#cfc7b9',
                  fontSize: 16,
                }}
              >
                <span style={{ color: colors.green }}>✓</span> {t}
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', fontSize: 13, color: '#7d766a' }}>
          Plano gratuito · sem cartão de crédito
        </div>
      </div>

      {/* formulário */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        <form onSubmit={aoEnviar} noValidate style={{ width: '100%', maxWidth: 380 }}>
          <div
            style={{
              display: 'flex',
              background: '#f1ede4',
              borderRadius: 12,
              padding: 5,
              marginBottom: 30,
            }}
          >
            <button type="button" onClick={() => trocarTab('entrar')} style={tabBtn(!cadastro)}>
              Entrar
            </button>
            <button
              type="button"
              onClick={() => trocarTab('cadastro')}
              style={tabBtn(cadastro)}
            >
              Criar conta
            </button>
          </div>

          <h1 style={{ fontFamily: fonts.display, fontWeight: 400, fontSize: 28, margin: '0 0 6px' }}>
            {cadastro ? 'Crie sua vitrine' : 'Bem-vindo de volta'}
          </h1>
          <p style={{ fontSize: 15, color: colors.muted, margin: '0 0 26px' }}>
            {cadastro
              ? 'Comece grátis e publique seus imóveis hoje.'
              : 'Acesse o painel da sua imobiliária.'}
          </p>

          {cadastro && (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 14 }}
            >
              <Field
                label="Nome completo"
                placeholder="Marina Albuquerque"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                erro={erros.nome?.[0]}
                autoComplete="name"
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <Field
                  label="CPF"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(mascararCpf(e.target.value))}
                  erro={erros.cpf?.[0]}
                  inputMode="numeric"
                  maxLength={14}
                />
                <Field
                  label="CRECI"
                  placeholder="SP 154.882"
                  value={creci}
                  onChange={(e) => setCreci(e.target.value)}
                  erro={erros.creci?.[0]}
                />
              </div>
              <Field
                label="Telefone / WhatsApp"
                placeholder="(11) 99812-4470"
                value={telefone}
                onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
                erro={erros.telefone?.[0] ?? erros.whatsapp?.[0]}
                autoComplete="tel"
                inputMode="tel"
                maxLength={15}
              />
              <Field
                label="Nome público da vitrine"
                placeholder="Marina Imóveis"
                value={nomePublico}
                onChange={(e) => setNomePublico(e.target.value)}
                erro={erros.nome_publico?.[0]}
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <Field
                  label="Cidade"
                  placeholder="Vitória"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  erro={erros.cidade?.[0]}
                />
                <div style={{ width: 90 }}>
                  <Field
                    label="UF"
                    placeholder="ES"
                    maxLength={2}
                    value={uf}
                    onChange={(e) => setUf(e.target.value.toUpperCase())}
                    erro={erros.uf?.[0]}
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field
              label="E-mail"
              type="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              erro={erros.email?.[0]}
              autoComplete="email"
            />
            <Field
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              erro={erros.senha?.[0]}
              autoComplete={cadastro ? 'new-password' : 'current-password'}
            />
          </div>

          {!cadastro && (
            <div style={{ textAlign: 'right', marginTop: 12 }}>
              <Link
                to="/esqueci-senha"
                style={{
                  fontSize: 14,
                  color: colors.orange,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Esqueci minha senha
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            style={{
              width: '100%',
              marginTop: 24,
              background: colors.orange,
              color: '#fff',
              border: 'none',
              borderRadius: 11,
              padding: 15,
              fontWeight: 600,
              fontSize: 16,
              cursor: enviando ? 'wait' : 'pointer',
              opacity: enviando ? 0.7 : 1,
            }}
          >
            {enviando
              ? 'Aguarde...'
              : cadastro
                ? 'Criar conta e começar'
                : 'Entrar no painel'}
          </button>

          <Link
            to="/"
            style={{
              display: 'block',
              textAlign: 'center',
              marginTop: 18,
              fontSize: 14,
              color: colors.mutedSoft,
              textDecoration: 'none',
            }}
          >
            ← Voltar para a CAVI
          </Link>
        </form>
      </div>
    </div>
  )
}
