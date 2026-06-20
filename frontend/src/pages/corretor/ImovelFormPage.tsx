// Cadastro/edição de imóvel do corretor.
//   /app/imoveis/novo        -> POST /api/imoveis
//   /app/imoveis/:id/editar  -> GET /api/imoveis/:id (preenche) + PUT /api/imoveis/:id
// Fotos (multipart) só ficam disponíveis após o imóvel existir (precisa de id):
//   POST   /api/imoveis/:id/fotos          (upload)
//   DELETE /api/imoveis/:id/fotos/:fotoId   (remover)
//   PATCH  /api/imoveis/:id/fotos/:fotoId/principal (definir capa)
// Porte visual de cavi-react/src/pages/PropertyForm.jsx, ligado à API real.
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ApiError, api, garantirCsrf } from '../../lib/api'
import { imovelSchema, type ImovelForm } from '../../lib/schemas'
import { colors, fonts } from '../../lib/theme'
import { StatusImovel, TipoImovel, FinalidadeImovel } from '../../lib/types'
import type { Imovel } from '../../lib/types'
import { toast } from '../../store/uiStore'

// =============================================================================
// Constantes
// =============================================================================

const FOTO_MAX_BYTES = 10 * 1024 * 1024 // 10MB (espelha backend)
const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const TIPOS_OPCOES = Object.values(TipoImovel)
const FINALIDADE_OPCOES = Object.values(FinalidadeImovel)

// =============================================================================
// Helpers de UI (porte do design)
// =============================================================================

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  border: `1px solid ${colors.field}`,
  borderRadius: 10,
  fontSize: 15,
  background: '#fff',
  boxSizing: 'border-box',
  fontFamily: fonts.body,
}

function Label({ children }: { children: ReactNode }) {
  return (
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.muted, marginBottom: 6 }}>
      {children}
    </label>
  )
}

function ErroCampo({ erro }: { erro?: string }) {
  if (!erro) return null
  return <div style={{ color: '#c0392b', fontSize: 12.5, marginTop: 5 }}>{erro}</div>
}

function Card({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 30, marginBottom: 22 }}>
      <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 18, margin: sub ? '0 0 6px' : '0 0 20px' }}>
        {title}
      </h2>
      {sub && <p style={{ fontSize: 14, color: colors.mutedSoft, margin: '0 0 18px' }}>{sub}</p>}
      {children}
    </div>
  )
}

// url_arquivo vem como "static/uploads/imoveis/..." (sem barra inicial).
function urlFoto(caminho: string): string {
  return caminho.startsWith('/') || caminho.startsWith('http') ? caminho : `/${caminho}`
}

// Estado inicial do formulário (campos como string para os inputs).
type CamposForm = {
  titulo: string
  tipo: string
  finalidade: string
  preco: string
  codigo: string
  descricao: string
  area: string
  quartos: string
  banheiros: string
  vagas: string
  cep: string
  logradouro: string
  numero: string
  bairro: string
  complemento: string
  cidade: string
  uf: string
}

const CAMPOS_VAZIOS: CamposForm = {
  titulo: '',
  tipo: TipoImovel.APARTAMENTO,
  finalidade: FinalidadeImovel.VENDA,
  preco: '',
  codigo: '',
  descricao: '',
  area: '',
  quartos: '',
  banheiros: '',
  vagas: '',
  cep: '',
  logradouro: '',
  numero: '',
  bairro: '',
  complemento: '',
  cidade: '',
  uf: '',
}

function camposDeImovel(im: Imovel): CamposForm {
  return {
    titulo: im.titulo ?? '',
    tipo: im.tipo ?? TipoImovel.APARTAMENTO,
    finalidade: im.finalidade ?? FinalidadeImovel.VENDA,
    preco: im.preco != null ? String(im.preco) : '',
    codigo: im.codigo ?? '',
    descricao: im.descricao ?? '',
    area: im.area != null ? String(im.area) : '',
    quartos: im.quartos != null ? String(im.quartos) : '',
    banheiros: im.banheiros != null ? String(im.banheiros) : '',
    vagas: im.vagas != null ? String(im.vagas) : '',
    cep: im.endereco?.cep ?? '',
    logradouro: im.endereco?.logradouro ?? '',
    numero: im.endereco?.numero ?? '',
    bairro: im.endereco?.bairro ?? '',
    complemento: im.endereco?.complemento ?? '',
    cidade: im.endereco?.cidade ?? '',
    uf: im.endereco?.uf ?? '',
  }
}

// Monta o payload validado pelo Zod a partir dos campos do form.
// Campos opcionais vazios viram undefined para não disparar coerções inválidas.
function montarPayload(c: CamposForm, status: string): unknown {
  const opcNum = (v: string) => (v.trim() === '' ? undefined : v)
  const opcStr = (v: string) => (v.trim() === '' ? undefined : v.trim())
  const endereco = {
    cep: opcStr(c.cep),
    logradouro: opcStr(c.logradouro),
    numero: opcStr(c.numero),
    bairro: opcStr(c.bairro),
    cidade: opcStr(c.cidade),
    uf: opcStr(c.uf),
    complemento: opcStr(c.complemento),
  }
  const temEndereco = Object.values(endereco).some((v) => v !== undefined)
  return {
    titulo: c.titulo.trim(),
    tipo: c.tipo,
    finalidade: c.finalidade,
    preco: c.preco.trim() === '' ? undefined : c.preco,
    codigo: opcStr(c.codigo),
    descricao: opcStr(c.descricao),
    area: opcNum(c.area),
    quartos: opcNum(c.quartos),
    banheiros: opcNum(c.banheiros),
    vagas: opcNum(c.vagas),
    destaque: false,
    status_publicacao: status,
    endereco: temEndereco ? endereco : undefined,
  }
}

// =============================================================================
// Página
// =============================================================================

export default function ImovelFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editando = Boolean(id)

  const [campos, setCampos] = useState<CamposForm>(CAMPOS_VAZIOS)
  const [publicado, setPublicado] = useState(false)
  const [fotos, setFotos] = useState<Imovel['fotos']>([])
  const [codigo, setCodigo] = useState<string | null>(null)

  const [erros, setErros] = useState<Record<string, string>>({})
  const [carregando, setCarregando] = useState(editando)
  const [salvando, setSalvando] = useState(false)
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const inputFileRef = useRef<HTMLInputElement | null>(null)

  // Carrega o imóvel ao editar.
  useEffect(() => {
    if (!editando) return
    let ativo = true
    setCarregando(true)
    api
      .get<Imovel>(`/imoveis/${id}`)
      .then((im) => {
        if (!ativo) return
        setCampos(camposDeImovel(im))
        setPublicado(im.status_publicacao === StatusImovel.PUBLICADO)
        setFotos(im.fotos ?? [])
        setCodigo(im.codigo ?? null)
      })
      .catch((e) => {
        if (!ativo) return
        const msg = e instanceof ApiError ? e.message : 'Não foi possível carregar o imóvel.'
        toast.erro(msg)
        navigate('/app/imoveis')
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [editando, id, navigate])

  function set<K extends keyof CamposForm>(campo: K, valor: string) {
    setCampos((c) => ({ ...c, [campo]: valor }))
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: '' }))
  }

  const titulo = editando ? 'Editar imóvel' : 'Cadastrar imóvel'
  const sub = useMemo(() => {
    if (editando) {
      const partes = [codigo ? `Código ${codigo}` : null, campos.bairro || null].filter(Boolean)
      return partes.length ? partes.join(' · ') : 'Atualize os dados do imóvel.'
    }
    return 'Preencha os dados do novo imóvel.'
  }, [editando, codigo, campos.bairro])

  // ---------------------------------------------------------------------------
  // Salvar (criar ou atualizar)
  // ---------------------------------------------------------------------------
  async function salvar() {
    const statusDesejado = publicado ? StatusImovel.PUBLICADO : StatusImovel.OCULTO
    const payload = montarPayload(campos, statusDesejado)

    const parsed = imovelSchema.safeParse(payload)
    if (!parsed.success) {
      const novosErros: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const chave = String(issue.path[0] ?? '')
        if (chave && !novosErros[chave]) novosErros[chave] = issue.message
      }
      setErros(novosErros)
      toast.erro('Revise os campos destacados.')
      return
    }

    setErros({})
    setSalvando(true)
    try {
      const corpo = parsed.data as ImovelForm
      if (editando) {
        await api.put<Imovel>(`/imoveis/${id}`, corpo)
        toast.sucesso('Imóvel atualizado com sucesso.')
        navigate('/app/imoveis')
      } else {
        const criado = await api.post<Imovel>('/imoveis', corpo)
        toast.sucesso('Imóvel cadastrado. Agora você pode adicionar fotos.')
        // Vai para a edição do recém-criado para permitir upload de fotos.
        navigate(`/app/imoveis/${criado.id}/editar`)
      }
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.errors) {
          const novosErros: Record<string, string> = {}
          for (const [campo, msgs] of Object.entries(e.errors)) {
            if (msgs?.[0]) novosErros[campo] = msgs[0]
          }
          setErros(novosErros)
        }
        toast.erro(e.message)
      } else {
        toast.erro('Erro ao salvar o imóvel. Tente novamente.')
      }
    } finally {
      setSalvando(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Fotos (multipart — fora do cliente JSON central)
  // ---------------------------------------------------------------------------
  async function enviarFoto(arquivo: File) {
    if (!id) return
    if (!TIPOS_FOTO.includes(arquivo.type)) {
      toast.erro('Formato inválido. Use JPG, PNG, WEBP ou GIF.')
      return
    }
    if (arquivo.size > FOTO_MAX_BYTES) {
      toast.erro('A foto excede o tamanho máximo de 10MB.')
      return
    }

    setEnviandoFoto(true)
    try {
      const csrf = await garantirCsrf()
      const fd = new FormData()
      fd.append('arquivo', arquivo)
      // Sem fotos ainda? a primeira já vira principal no backend.
      fd.append('foto_principal', fotos.length === 0 ? 'true' : 'false')

      const resp = await fetch(`/api/imoveis/${id}/fotos`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-Token': csrf, Accept: 'application/json' },
        body: fd,
      })
      if (!resp.ok) {
        const data = await resp.json().catch(() => null)
        throw new ApiError(resp.status, data?.detail || 'Falha ao enviar a foto.', data?.type || 'error')
      }
      const atualizado = (await resp.json()) as Imovel
      setFotos(atualizado.fotos ?? [])
      toast.sucesso('Foto adicionada.')
    } catch (e) {
      toast.erro(e instanceof ApiError ? e.message : 'Erro ao enviar a foto.')
    } finally {
      setEnviandoFoto(false)
      if (inputFileRef.current) inputFileRef.current.value = ''
    }
  }

  async function removerFoto(fotoId: number) {
    if (!id) return
    try {
      await api.delete(`/imoveis/${id}/fotos/${fotoId}`)
      setFotos((fs) => fs.filter((f) => f.id !== fotoId))
      toast.sucesso('Foto removida.')
    } catch (e) {
      toast.erro(e instanceof ApiError ? e.message : 'Erro ao remover a foto.')
    }
  }

  async function definirPrincipal(fotoId: number) {
    if (!id) return
    try {
      const atualizado = await api.patch<Imovel>(`/imoveis/${id}/fotos/${fotoId}/principal`)
      setFotos(atualizado.fotos ?? [])
      toast.sucesso('Foto de capa definida.')
    } catch (e) {
      toast.erro(e instanceof ApiError ? e.message : 'Erro ao definir a capa.')
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (carregando) {
    return (
      <div style={{ padding: '60px 44px', color: colors.mutedSoft, fontFamily: fonts.body }}>
        <span className="spinner-border spinner-border-sm me-2" /> Carregando imóvel...
      </div>
    )
  }

  return (
    <div style={{ padding: '34px 44px', maxWidth: 920, fontFamily: fonts.body, color: colors.ink }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 14, color: colors.mutedSoft, marginBottom: 20 }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/app/imoveis')}>
          Meus imóveis
        </span>
        &nbsp;/&nbsp; <span style={{ color: colors.muted }}>{titulo}</span>
      </div>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: fonts.display, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: '0 0 4px' }}>
          {titulo}
        </h1>
        <div style={{ fontSize: 14, color: colors.mutedSoft }}>{sub}</div>
      </div>

      {/* Informações principais */}
      <Card title="Informações principais">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Label>Título do anúncio</Label>
            <input
              value={campos.titulo}
              onChange={(e) => set('titulo', e.target.value)}
              placeholder="Ex: Apartamento reformado em Pinheiros"
              maxLength={200}
              style={{ ...inputStyle, borderColor: erros.titulo ? '#e0a89e' : colors.field }}
            />
            <ErroCampo erro={erros.titulo} />
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <Label>Tipo</Label>
              <select
                value={campos.tipo}
                onChange={(e) => set('tipo', e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer', borderColor: erros.tipo ? '#e0a89e' : colors.field }}
              >
                {TIPOS_OPCOES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ErroCampo erro={erros.tipo} />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <Label>Finalidade</Label>
              <select
                value={campos.finalidade}
                onChange={(e) => set('finalidade', e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer', borderColor: erros.finalidade ? '#e0a89e' : colors.field }}
              >
                {FINALIDADE_OPCOES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <ErroCampo erro={erros.finalidade} />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <Label>Preço (R$)</Label>
              <input
                value={campos.preco}
                onChange={(e) => set('preco', e.target.value)}
                placeholder="890000"
                inputMode="decimal"
                style={{ ...inputStyle, borderColor: erros.preco ? '#e0a89e' : colors.field }}
              />
              <ErroCampo erro={erros.preco} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <Label>Código (opcional)</Label>
              <input
                value={campos.codigo}
                onChange={(e) => set('codigo', e.target.value)}
                placeholder="AP-0421"
                maxLength={50}
                style={{ ...inputStyle, borderColor: erros.codigo ? '#e0a89e' : colors.field }}
              />
              <ErroCampo erro={erros.codigo} />
            </div>
          </div>
          <div>
            <Label>Descrição</Label>
            <textarea
              rows={4}
              value={campos.descricao}
              onChange={(e) => set('descricao', e.target.value)}
              placeholder="Descreva os destaques do imóvel..."
              maxLength={5000}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, borderColor: erros.descricao ? '#e0a89e' : colors.field }}
            />
            <ErroCampo erro={erros.descricao} />
          </div>
        </div>
      </Card>

      {/* Características */}
      <Card title="Características">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {(
            [
              ['Área (m²)', 'area', '78', 'decimal'],
              ['Quartos', 'quartos', '2', 'numeric'],
              ['Banheiros', 'banheiros', '2', 'numeric'],
              ['Vagas', 'vagas', '1', 'numeric'],
            ] as const
          ).map(([rotulo, campo, ph, modo]) => (
            <div key={campo}>
              <Label>{rotulo}</Label>
              <input
                value={campos[campo]}
                onChange={(e) => set(campo, e.target.value)}
                placeholder={ph}
                inputMode={modo}
                style={{ ...inputStyle, borderColor: erros[campo] ? '#e0a89e' : colors.field }}
              />
              <ErroCampo erro={erros[campo]} />
            </div>
          ))}
        </div>
      </Card>

      {/* Endereço */}
      <Card title="Endereço">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 180 }}>
              <Label>CEP</Label>
              <input value={campos.cep} onChange={(e) => set('cep', e.target.value)} placeholder="05422-010" style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <Label>Logradouro</Label>
              <input
                value={campos.logradouro}
                onChange={(e) => set('logradouro', e.target.value)}
                placeholder="Rua dos Pinheiros"
                maxLength={200}
                style={{ ...inputStyle, borderColor: erros.logradouro ? '#e0a89e' : colors.field }}
              />
              <ErroCampo erro={erros.logradouro} />
            </div>
            <div style={{ width: 120 }}>
              <Label>Número</Label>
              <input value={campos.numero} onChange={(e) => set('numero', e.target.value)} placeholder="1240" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <Label>Bairro</Label>
              <input
                value={campos.bairro}
                onChange={(e) => set('bairro', e.target.value)}
                placeholder="Pinheiros"
                maxLength={100}
                style={{ ...inputStyle, borderColor: erros.bairro ? '#e0a89e' : colors.field }}
              />
              <ErroCampo erro={erros.bairro} />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <Label>Complemento</Label>
              <input
                value={campos.complemento}
                onChange={(e) => set('complemento', e.target.value)}
                placeholder="Apto 81"
                maxLength={200}
                style={{ ...inputStyle, borderColor: erros.complemento ? '#e0a89e' : colors.field }}
              />
              <ErroCampo erro={erros.complemento} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <Label>Cidade</Label>
              <input
                value={campos.cidade}
                onChange={(e) => set('cidade', e.target.value)}
                placeholder="São Paulo"
                maxLength={100}
                style={{ ...inputStyle, borderColor: erros.cidade ? '#e0a89e' : colors.field }}
              />
              <ErroCampo erro={erros.cidade} />
            </div>
            <div style={{ width: 110 }}>
              <Label>UF</Label>
              <input
                value={campos.uf}
                onChange={(e) => set('uf', e.target.value.toUpperCase())}
                placeholder="SP"
                maxLength={2}
                style={{ ...inputStyle, textTransform: 'uppercase', borderColor: erros.uf ? '#e0a89e' : colors.field }}
              />
              <ErroCampo erro={erros.uf} />
            </div>
          </div>
        </div>
      </Card>

      {/* Fotos */}
      <Card title="Fotos" sub="A primeira foto é a capa do anúncio. Clique numa foto para defini-la como capa.">
        {!editando ? (
          <div style={{ fontSize: 14, color: colors.mutedSoft }}>
            Salve o imóvel primeiro para poder enviar fotos.
          </div>
        ) : (
          <>
            <input
              ref={inputFileRef}
              type="file"
              accept={TIPOS_FOTO.join(',')}
              style={{ display: 'none' }}
              onChange={(e) => {
                const arq = e.target.files?.[0]
                if (arq) void enviarFoto(arq)
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {fotos.map((foto) => (
                <div
                  key={foto.id}
                  style={{
                    position: 'relative',
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: foto.foto_principal ? `2px solid ${colors.orange}` : `1px solid ${colors.borderSoft}`,
                  }}
                >
                  <img
                    src={urlFoto(foto.url_arquivo)}
                    alt={foto.legenda ?? 'Foto do imóvel'}
                    title={foto.foto_principal ? 'Foto de capa' : 'Definir como capa'}
                    onClick={() => !foto.foto_principal && void definirPrincipal(foto.id)}
                    style={{
                      width: '100%',
                      height: 96,
                      objectFit: 'cover',
                      display: 'block',
                      cursor: foto.foto_principal ? 'default' : 'pointer',
                    }}
                  />
                  {foto.foto_principal && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 6,
                        left: 6,
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#fff',
                        background: colors.orange,
                        borderRadius: 6,
                        padding: '2px 7px',
                      }}
                    >
                      CAPA
                    </span>
                  )}
                  <span
                    onClick={() => void removerFoto(foto.id)}
                    title="Remover foto"
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: 'rgba(31,27,24,0.7)',
                      color: '#fff',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </span>
                </div>
              ))}
              <div
                onClick={() => !enviandoFoto && inputFileRef.current?.click()}
                style={{
                  height: 96,
                  border: '2px dashed #d8d0c2',
                  borderRadius: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  cursor: enviandoFoto ? 'wait' : 'pointer',
                  color: colors.faint,
                }}
              >
                {enviandoFoto ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <>
                    <span style={{ fontSize: 22 }}>＋</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Adicionar</span>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Publicação */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          padding: '22px 30px',
          marginBottom: 28,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Publicar imóvel na vitrine</div>
          <div style={{ fontSize: 13, color: colors.mutedSoft }}>
            Imóveis ocultos ficam salvos mas não aparecem no catálogo público.
          </div>
        </div>
        <div
          role="switch"
          aria-checked={publicado}
          onClick={() => setPublicado((v) => !v)}
          style={{
            width: 52,
            height: 30,
            borderRadius: 999,
            background: publicado ? colors.green : '#d8d0c2',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background .15s',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 3,
              left: publicado ? 25 : 3,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transition: 'left .15s',
            }}
          />
        </div>
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button
          onClick={() => navigate('/app/imoveis')}
          disabled={salvando}
          style={{
            padding: '14px 24px',
            border: `1px solid ${colors.field}`,
            background: '#fff',
            borderRadius: 11,
            fontWeight: 600,
            fontSize: 15,
            color: colors.muted,
            cursor: salvando ? 'not-allowed' : 'pointer',
            fontFamily: fonts.body,
          }}
        >
          Cancelar
        </button>
        <button
          onClick={() => void salvar()}
          disabled={salvando}
          style={{
            padding: '14px 28px',
            border: 'none',
            background: colors.orange,
            color: '#fff',
            borderRadius: 11,
            fontWeight: 600,
            fontSize: 15,
            cursor: salvando ? 'wait' : 'pointer',
            fontFamily: fonts.body,
          }}
        >
          {salvando ? 'Salvando...' : 'Salvar imóvel'}
        </button>
      </div>
    </div>
  )
}
