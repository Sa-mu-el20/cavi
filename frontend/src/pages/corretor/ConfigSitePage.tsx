// Configurações do catálogo público do corretor (/app/config).
// Porte de cavi-react/src/pages/Config.jsx, ligado à API real:
//   GET  /api/minha-conta  -> ContaSite
//   PUT  /api/minha-conta  -> ContaSite (nome_publico, slug, descricao,
//        whatsapp, creci, cidade, uf, bairro, cor)
// O `logo` é gerenciado por outro fluxo (upload) e NÃO é enviado neste PUT
// — exibimos o logo atual quando existe, mas não o editamos aqui.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import { useFetch } from '../../hooks/useFetch'
import { contaSiteSchema } from '../../lib/schemas'
import { mascararTelefone } from '../../lib/masks'
import type { ContaSite } from '../../lib/types'
import { colors, fonts } from '../../lib/theme'
import { toast } from '../../store/uiStore'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

// Paleta de cores de destaque oferecida (espelha o design).
const CORES = ['#d97a2b', '#5a8f7b', '#3f6f9e', '#b8863b', '#8a6fb0', '#1f1b18']

// UFs brasileiras (mesmo conjunto validado no backend).
const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

type CampoErros = Record<string, string>

interface FormState {
  nome_publico: string
  slug: string
  descricao: string
  whatsapp: string
  creci: string
  cidade: string
  uf: string
  bairro: string
  cor: string
}

function vazioParaForm(conta: ContaSite): FormState {
  return {
    nome_publico: conta.nome_publico ?? '',
    slug: conta.slug ?? '',
    descricao: conta.descricao ?? '',
    whatsapp: mascararTelefone(conta.whatsapp ?? ''),
    creci: conta.creci ?? '',
    cidade: conta.cidade ?? '',
    uf: conta.uf ?? '',
    bairro: conta.bairro ?? '',
    cor: conta.cor || colors.orange,
  }
}

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

export default function ConfigSitePage() {
  const navigate = useNavigate()

  const { data, carregando, erro, recarregar } = useFetch<ContaSite>(
    (signal) => api.get<ContaSite>('/minha-conta', { signal }),
    [],
  )

  const [form, setForm] = useState<FormState | null>(null)
  const [errosCampo, setErrosCampo] = useState<CampoErros>({})
  const [salvando, setSalvando] = useState(false)

  // Sincroniza o formulário quando a conta é carregada/recarregada.
  useEffect(() => {
    if (data) setForm(vazioParaForm(data))
  }, [data])

  const setCampo = (campo: keyof FormState, valor: string) => {
    setForm((f) => (f ? { ...f, [campo]: valor } : f))
    setErrosCampo((e) => {
      if (!e[campo]) return e
      const { [campo]: _omit, ...resto } = e
      return resto
    })
  }

  const slugPreview = useMemo(() => form?.slug?.trim() || data?.slug || '', [form, data])

  async function salvar() {
    if (!form || !data) return

    // Validação no cliente espelhando contaSiteSchema (slug opcional → omitido se vazio).
    const candidato = {
      nome_publico: form.nome_publico.trim(),
      slug: form.slug.trim() || undefined,
      descricao: form.descricao.trim() || undefined,
      whatsapp: form.whatsapp.trim() || undefined,
      creci: form.creci.trim() || undefined,
      cidade: form.cidade.trim() || undefined,
      uf: form.uf.trim() || undefined,
      bairro: form.bairro.trim() || undefined,
      cor: form.cor,
    }

    const parsed = contaSiteSchema.safeParse(candidato)
    if (!parsed.success) {
      const novos: CampoErros = {}
      for (const issue of parsed.error.issues) {
        const chave = String(issue.path[0] ?? '')
        if (chave && !novos[chave]) novos[chave] = issue.message
      }
      setErrosCampo(novos)
      toast.aviso('Verifique os campos destacados.')
      return
    }

    setSalvando(true)
    setErrosCampo({})
    try {
      const atualizada = await api.put<ContaSite>('/minha-conta', parsed.data)
      setForm(vazioParaForm(atualizada))
      toast.sucesso('Catálogo atualizado com sucesso.')
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 422 && e.errors) {
          const novos: CampoErros = {}
          for (const [campo, msgs] of Object.entries(e.errors)) {
            if (msgs?.[0]) novos[campo] = msgs[0]
          }
          setErrosCampo(novos)
          toast.aviso('Verifique os campos destacados.')
        } else {
          toast.erro(e.message)
        }
      } else {
        toast.erro('Não foi possível salvar as alterações.')
      }
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <div style={{ padding: '60px 44px', display: 'flex', justifyContent: 'center' }}>
        <Spinner />
      </div>
    )
  }

  if (erro || !data || !form) {
    const naoCadastrada = erro?.status === 404
    return (
      <div style={{ padding: '34px 44px', maxWidth: 980 }}>
        <EmptyState
          icon="◳"
          titulo={naoCadastrada ? 'Catálogo ainda não cadastrado' : 'Não foi possível carregar'}
          mensagem={
            naoCadastrada
              ? 'Seu catálogo público ainda não está disponível para edição.'
              : erro?.message || 'Tente novamente em instantes.'
          }
        >
          {!naoCadastrada && (
            <button
              type="button"
              onClick={recarregar}
              style={{
                background: 'transparent',
                color: colors.orange,
                border: `1px solid ${colors.orange}`,
                borderRadius: 10,
                padding: '10px 18px',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Tentar novamente
            </button>
          )}
        </EmptyState>
      </div>
    )
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

  return (
    <div style={{ padding: '34px 44px', maxWidth: 980 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 28,
          gap: 16,
        }}
      >
        <div>
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
            Configurações do site
          </h1>
          <div style={{ fontSize: 14, color: colors.mutedSoft }}>
            Personalize seu catálogo público.
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/v/${slugPreview}`)}
          disabled={!slugPreview}
          style={{
            background: '#fff',
            color: colors.ink,
            border: `1px solid ${colors.field}`,
            borderRadius: 11,
            padding: '13px 20px',
            fontWeight: 600,
            fontSize: 15,
            cursor: slugPreview ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap',
            fontFamily: fonts.body,
          }}
        >
          ↗ Ver catálogo
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 24,
          alignItems: 'start',
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void salvar()
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 22 }}
        >
          {/* Identidade */}
          <div style={cardStyle}>
            <h2 style={h2Style}>Identidade</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <Label>Nome público</Label>
                <input
                  value={form.nome_publico}
                  onChange={(e) => setCampo('nome_publico', e.target.value)}
                  maxLength={120}
                  style={inputStyle(!!errosCampo.nome_publico)}
                />
                <ErroCampo msg={errosCampo.nome_publico} />
              </div>
              <div>
                <Label>Endereço do catálogo</Label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: `1px solid ${errosCampo.slug ? '#c0392b' : colors.field}`,
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: '#fff',
                  }}
                >
                  <span style={{ padding: '13px 0 13px 14px', fontSize: 15, color: colors.faint }}>
                    cavi.ifes.site/v/
                  </span>
                  <input
                    value={form.slug}
                    onChange={(e) => setCampo('slug', e.target.value)}
                    placeholder="derivado-do-nome"
                    maxLength={128}
                    style={{
                      flex: 1,
                      padding: '13px 14px 13px 2px',
                      border: 'none',
                      fontSize: 15,
                      background: 'transparent',
                      outline: 'none',
                      fontFamily: fonts.body,
                      color: colors.ink,
                    }}
                  />
                </div>
                <ErroCampo msg={errosCampo.slug} />
              </div>
              <div>
                <Label>Apresentação</Label>
                <textarea
                  rows={3}
                  value={form.descricao}
                  onChange={(e) => setCampo('descricao', e.target.value)}
                  maxLength={2000}
                  style={{ ...inputStyle(!!errosCampo.descricao), resize: 'vertical', lineHeight: 1.5 }}
                />
                <ErroCampo msg={errosCampo.descricao} />
              </div>
            </div>
          </div>

          {/* Contato + atuação */}
          <div style={cardStyle}>
            <h2 style={h2Style}>Contato e atuação</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <Label>WhatsApp</Label>
                  <input
                    value={form.whatsapp}
                    onChange={(e) => setCampo('whatsapp', mascararTelefone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    inputMode="tel"
                    maxLength={15}
                    style={inputStyle(!!errosCampo.whatsapp)}
                  />
                  <ErroCampo msg={errosCampo.whatsapp} />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <Label>CRECI</Label>
                  <input
                    value={form.creci}
                    onChange={(e) => setCampo('creci', e.target.value)}
                    maxLength={30}
                    style={inputStyle(!!errosCampo.creci)}
                  />
                  <ErroCampo msg={errosCampo.creci} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: 180 }}>
                  <Label>Cidade</Label>
                  <input
                    value={form.cidade}
                    onChange={(e) => setCampo('cidade', e.target.value)}
                    maxLength={120}
                    style={inputStyle(!!errosCampo.cidade)}
                  />
                  <ErroCampo msg={errosCampo.cidade} />
                </div>
                <div style={{ width: 110 }}>
                  <Label>UF</Label>
                  <select
                    value={form.uf}
                    onChange={(e) => setCampo('uf', e.target.value)}
                    style={inputStyle(!!errosCampo.uf)}
                  >
                    <option value="">—</option>
                    {UFS.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                  <ErroCampo msg={errosCampo.uf} />
                </div>
                <div style={{ flex: 2, minWidth: 180 }}>
                  <Label>Bairro</Label>
                  <input
                    value={form.bairro}
                    onChange={(e) => setCampo('bairro', e.target.value)}
                    maxLength={100}
                    style={inputStyle(!!errosCampo.bairro)}
                  />
                  <ErroCampo msg={errosCampo.bairro} />
                </div>
              </div>
            </div>
          </div>

          {/* Aparência */}
          <div style={cardStyle}>
            <h2 style={{ ...h2Style, margin: '0 0 6px' }}>Aparência</h2>
            <p style={{ fontSize: 14, color: colors.mutedSoft, margin: '0 0 18px' }}>
              Logo e cor de destaque do seu catálogo.
            </p>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div>
                <Label>Logo</Label>
                {data.logo ? (
                  <img
                    src={data.logo}
                    alt="Logo do catálogo"
                    style={{
                      width: 96,
                      height: 96,
                      objectFit: 'cover',
                      borderRadius: 14,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 96,
                      height: 96,
                      border: '2px dashed #d8d0c2',
                      borderRadius: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      color: colors.faint,
                      background: colors.cream,
                    }}
                  >
                    <span style={{ fontSize: 22 }}>＋</span>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>Sem logo</span>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <Label>Cor de destaque</Label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {CORES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Cor ${c}`}
                      onClick={() => setCampo('cor', c)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: c,
                        cursor: 'pointer',
                        border: 'none',
                        padding: 0,
                        boxShadow:
                          form.cor.toLowerCase() === c.toLowerCase()
                            ? `0 0 0 3px #fff, 0 0 0 5px ${c}`
                            : 'none',
                      }}
                    />
                  ))}
                </div>
                <ErroCampo msg={errosCampo.cor} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
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
              {salvando ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </form>

        {/* Pré-visualização */}
        <div style={{ position: 'sticky', top: 34 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.mutedSoft, marginBottom: 10 }}>
            Pré-visualização
          </div>
          <div
            style={{
              background: '#fff',
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 18px 44px -28px rgba(60,45,25,0.35)',
            }}
          >
            <div
              style={{
                height: 34,
                background: colors.cream,
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                padding: '0 14px',
                fontSize: 12,
                color: colors.faint,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              cavi.ifes.site/v/{slugPreview}
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: form.cor,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 18,
                    overflow: 'hidden',
                    flex: 'none',
                  }}
                >
                  {data.logo ? (
                    <img
                      src={data.logo}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    (form.nome_publico[0] || 'V').toUpperCase()
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: fonts.display,
                      fontWeight: 500,
                      fontSize: 17,
                      color: colors.ink,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {form.nome_publico || 'Meu catálogo'}
                  </div>
                  <div style={{ fontSize: 11, color: colors.mutedSoft }}>
                    {form.creci ? `CRECI ${form.creci}` : 'Corretor de imóveis'}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: colors.muted,
                  lineHeight: 1.5,
                  marginBottom: 14,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {form.descricao || 'Sua apresentação aparecerá aqui para os visitantes.'}
              </div>
              <div style={{ fontSize: 12, color: colors.mutedSoft, marginBottom: 14 }}>
                {[form.bairro, form.cidade, form.uf].filter(Boolean).join(' · ') ||
                  'Região de atuação'}
              </div>
              <div
                style={{
                  background: colors.green,
                  color: colors.greenDark,
                  textAlign: 'center',
                  padding: 9,
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                WhatsApp
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
