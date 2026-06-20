// Edição do próprio perfil do corretor (/app/perfil): foto, dados e senha.
// Ligado à API real:
//   PUT /api/usuario/foto   -> UsuarioResponse  (foto cropada em base64 data URL)
//   PUT /api/usuario/perfil -> UsuarioResponse  (nome, email)
//   PUT /api/usuario/senha  -> MensagemResponse (senha_atual, senha_nova, confirmar_senha)
// O usuário em memória (authStore) é atualizado após foto/dados para refletir
// imediatamente na sidebar e no resto do app.
import { useRef, useState } from 'react'
import { api, ApiError } from '../../lib/api'
import { editarPerfilSchema, alterarSenhaSchema } from '../../lib/schemas'
import type { Usuario } from '../../lib/types'
import { useAuthStore } from '../../store/authStore'
import { colors, fonts } from '../../lib/theme'
import { toast } from '../../store/uiStore'

type CampoErros = Record<string, string>

// Limite espelha a validação do backend (10MB de binário).
const FOTO_MAX_BYTES = 10 * 1024 * 1024

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.muted, marginBottom: 6 }}
    >
      {children}
    </label>
  )
}

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  border: `1px solid ${colors.field}`,
  borderRadius: 10,
  fontSize: 15,
  background: '#fff',
  fontFamily: fonts.body,
  color: colors.ink,
  boxSizing: 'border-box',
}

function inputStyle(invalido?: boolean): React.CSSProperties {
  return invalido ? { ...inputBase, borderColor: '#c0392b' } : inputBase
}

function ErroCampo({ msg }: { msg?: string }) {
  if (!msg) return null
  return <div style={{ color: '#c0392b', fontSize: 12, marginTop: 5 }}>{msg}</div>
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: `1px solid ${colors.border}`,
  borderRadius: 16,
  padding: 30,
}
const h2Style: React.CSSProperties = {
  fontFamily: fonts.display,
  fontWeight: 500,
  fontSize: 18,
  margin: '0 0 20px',
  color: colors.ink,
}

function botaoSubmit(salvando: boolean, label: string) {
  return (
    <button
      type="submit"
      disabled={salvando}
      style={{
        padding: '14px 28px',
        border: 'none',
        background: salvando ? colors.orangeDeep : colors.orange,
        color: '#fff',
        borderRadius: 11,
        fontWeight: 600,
        fontSize: 15,
        cursor: salvando ? 'wait' : 'pointer',
        fontFamily: fonts.body,
      }}
    >
      {label}
    </button>
  )
}

// Extrai erros de validação 422 do contrato {errors: {campo: [msg]}}.
function errosDe422(e: ApiError): CampoErros {
  const novos: CampoErros = {}
  if (e.errors) {
    for (const [campo, msgs] of Object.entries(e.errors)) {
      if (msgs?.[0]) novos[campo] = msgs[0]
    }
  }
  return novos
}

export default function EditPerfilPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const setUsuario = useAuthStore((s) => s.setUsuario)

  // ===== Foto de perfil =====
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  // Versão incremental p/ furar cache da <img> (a URL não muda após upload).
  const [fotoV, setFotoV] = useState(0)

  // ===== Dados (nome/email) =====
  const [dados, setDados] = useState({ nome: usuario?.nome ?? '', email: usuario?.email ?? '' })
  const [errosDados, setErrosDados] = useState<CampoErros>({})
  const [salvandoDados, setSalvandoDados] = useState(false)

  // ===== Senha =====
  const senhaVazia = { senha_atual: '', senha_nova: '', confirmar_senha: '' }
  const [senha, setSenha] = useState(senhaVazia)
  const [errosSenha, setErrosSenha] = useState<CampoErros>({})
  const [salvandoSenha, setSalvandoSenha] = useState(false)

  if (!usuario) return null

  const fotoSrc = `${usuario.foto_url}${usuario.foto_url.includes('?') ? '&' : '?'}v=${fotoV}`

  const setCampoDados = (campo: 'nome' | 'email', valor: string) => {
    setDados((d) => ({ ...d, [campo]: valor }))
    setErrosDados((e) => {
      if (!e[campo]) return e
      const { [campo]: _omit, ...resto } = e
      return resto
    })
  }

  const setCampoSenha = (campo: keyof typeof senhaVazia, valor: string) => {
    setSenha((s) => ({ ...s, [campo]: valor }))
    setErrosSenha((e) => {
      if (!e[campo]) return e
      const { [campo]: _omit, ...resto } = e
      return resto
    })
  }

  function abrirSeletorFoto() {
    fileInputRef.current?.click()
  }

  async function trocarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = '' // permite reescolher o mesmo arquivo depois
    if (!arquivo) return

    if (!arquivo.type.startsWith('image/')) {
      toast.aviso('Selecione um arquivo de imagem.')
      return
    }
    if (arquivo.size > FOTO_MAX_BYTES) {
      toast.aviso('Imagem muito grande. O tamanho máximo é 10MB.')
      return
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(arquivo)
    }).catch(() => null)

    if (!dataUrl) {
      toast.erro('Não foi possível ler a imagem.')
      return
    }

    setEnviandoFoto(true)
    try {
      const atualizado = await api.put<Usuario>('/usuario/foto', { foto_base64: dataUrl })
      setUsuario(atualizado)
      setFotoV((v) => v + 1)
      toast.sucesso('Foto atualizada com sucesso.')
    } catch (err) {
      if (err instanceof ApiError) toast.erro(err.message)
      else toast.erro('Não foi possível atualizar a foto.')
    } finally {
      setEnviandoFoto(false)
    }
  }

  async function salvarDados() {
    const parsed = editarPerfilSchema.safeParse({
      nome: dados.nome.trim(),
      email: dados.email.trim(),
    })
    if (!parsed.success) {
      const novos: CampoErros = {}
      for (const issue of parsed.error.issues) {
        const chave = String(issue.path[0] ?? '')
        if (chave && !novos[chave]) novos[chave] = issue.message
      }
      setErrosDados(novos)
      toast.aviso('Verifique os campos destacados.')
      return
    }

    setSalvandoDados(true)
    setErrosDados({})
    try {
      const atualizado = await api.put<Usuario>('/usuario/perfil', parsed.data)
      setUsuario(atualizado)
      setDados({ nome: atualizado.nome, email: atualizado.email })
      toast.sucesso('Dados atualizados com sucesso.')
    } catch (e) {
      if (e instanceof ApiError) {
        // 422 (validação) e 409 (e-mail em uso) trazem o contrato {errors}.
        if ((e.status === 422 || e.status === 409) && e.errors) {
          setErrosDados(errosDe422(e))
          toast.aviso('Verifique os campos destacados.')
        } else {
          toast.erro(e.message)
        }
      } else {
        toast.erro('Não foi possível salvar os dados.')
      }
    } finally {
      setSalvandoDados(false)
    }
  }

  async function salvarSenha() {
    const parsed = alterarSenhaSchema.safeParse(senha)
    if (!parsed.success) {
      const novos: CampoErros = {}
      for (const issue of parsed.error.issues) {
        const chave = String(issue.path[0] ?? '')
        if (chave && !novos[chave]) novos[chave] = issue.message
      }
      setErrosSenha(novos)
      toast.aviso('Verifique os campos destacados.')
      return
    }

    setSalvandoSenha(true)
    setErrosSenha({})
    try {
      await api.put('/usuario/senha', parsed.data)
      setSenha(senhaVazia)
      toast.sucesso('Senha alterada com sucesso.')
    } catch (e) {
      if (e instanceof ApiError) {
        // 400 (senha atual incorreta / nova igual) e 422 trazem {errors}.
        if ((e.status === 400 || e.status === 422) && e.errors) {
          setErrosSenha(errosDe422(e))
          toast.aviso('Verifique os campos destacados.')
        } else {
          toast.erro(e.message)
        }
      } else {
        toast.erro('Não foi possível alterar a senha.')
      }
    } finally {
      setSalvandoSenha(false)
    }
  }

  return (
    <div style={{ padding: '34px 44px', maxWidth: 760 }}>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: fonts.display,
            fontWeight: 400,
            fontSize: 32,
            lineHeight: 1.15,
            margin: '0 0 4px',
            color: colors.ink,
          }}
        >
          Meu perfil
        </h1>
        <div style={{ fontSize: 14, color: colors.mutedSoft }}>
          Atualize seus dados de acesso e sua foto.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Foto de perfil */}
        <div style={cardStyle}>
          <h2 style={h2Style}>Foto de perfil</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
            <img
              src={fotoSrc}
              alt="Foto de perfil"
              style={{
                width: 96,
                height: 96,
                objectFit: 'cover',
                borderRadius: '50%',
                border: `1px solid ${colors.border}`,
                background: colors.cream,
              }}
            />
            <div style={{ flex: 1, minWidth: 220 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => void trocarFoto(e)}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={abrirSeletorFoto}
                disabled={enviandoFoto}
                style={{
                  background: '#fff',
                  color: colors.ink,
                  border: `1px solid ${colors.field}`,
                  borderRadius: 11,
                  padding: '12px 20px',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: enviandoFoto ? 'wait' : 'pointer',
                  fontFamily: fonts.body,
                }}
              >
                {enviandoFoto ? 'Enviando…' : 'Trocar foto'}
              </button>
              <div style={{ fontSize: 12, color: colors.mutedSoft, marginTop: 10 }}>
                JPG, PNG ou WebP. Tamanho máximo de 10MB.
              </div>
            </div>
          </div>
        </div>

        {/* Dados pessoais */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void salvarDados()
          }}
          style={cardStyle}
        >
          <h2 style={h2Style}>Dados pessoais</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Label>Nome completo</Label>
              <input
                value={dados.nome}
                onChange={(e) => setCampoDados('nome', e.target.value)}
                maxLength={128}
                autoComplete="name"
                style={inputStyle(!!errosDados.nome)}
              />
              <ErroCampo msg={errosDados.nome} />
            </div>
            <div>
              <Label>E-mail</Label>
              <input
                value={dados.email}
                onChange={(e) => setCampoDados('email', e.target.value)}
                type="email"
                maxLength={254}
                autoComplete="email"
                style={inputStyle(!!errosDados.email)}
              />
              <ErroCampo msg={errosDados.email} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
            {botaoSubmit(salvandoDados, salvandoDados ? 'Salvando…' : 'Salvar dados')}
          </div>
        </form>

        {/* Alterar senha */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void salvarSenha()
          }}
          style={cardStyle}
        >
          <h2 style={h2Style}>Alterar senha</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Label>Senha atual</Label>
              <input
                value={senha.senha_atual}
                onChange={(e) => setCampoSenha('senha_atual', e.target.value)}
                type="password"
                autoComplete="current-password"
                style={inputStyle(!!errosSenha.senha_atual)}
              />
              <ErroCampo msg={errosSenha.senha_atual} />
            </div>
            <div>
              <Label>Nova senha</Label>
              <input
                value={senha.senha_nova}
                onChange={(e) => setCampoSenha('senha_nova', e.target.value)}
                type="password"
                autoComplete="new-password"
                style={inputStyle(!!errosSenha.senha_nova)}
              />
              <ErroCampo msg={errosSenha.senha_nova} />
              {!errosSenha.senha_nova && (
                <div style={{ fontSize: 12, color: colors.mutedSoft, marginTop: 5 }}>
                  Mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial.
                </div>
              )}
            </div>
            <div>
              <Label>Confirmar nova senha</Label>
              <input
                value={senha.confirmar_senha}
                onChange={(e) => setCampoSenha('confirmar_senha', e.target.value)}
                type="password"
                autoComplete="new-password"
                style={inputStyle(!!errosSenha.confirmar_senha)}
              />
              <ErroCampo msg={errosSenha.confirmar_senha} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
            {botaoSubmit(salvandoSenha, salvandoSenha ? 'Alterando…' : 'Alterar senha')}
          </div>
        </form>
      </div>
    </div>
  )
}
