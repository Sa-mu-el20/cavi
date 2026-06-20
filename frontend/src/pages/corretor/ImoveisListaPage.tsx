// Lista de imóveis do corretor (/app/imoveis).
// Visual portado de cavi-react/src/pages/Properties.jsx, ligado à API real:
//   GET    /api/imoveis              (paginado; params pagina/por_pagina/busca/status_publicacao)
//   PATCH  /api/imoveis/{id}/publicacao  (alterna Publicado/Oculto)
//   DELETE /api/imoveis/{id}         (exclui; confirmação via uiStore)
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { api } from '../../lib/api'
import { useFetch } from '../../hooks/useFetch'
import { toast, useUIStore } from '../../store/uiStore'
import { colors, fonts } from '../../lib/theme'
import { formatarPrecoImovel } from '../../lib/format'
import { StatusImovel, type ImovelResumo, type PaginaResponse } from '../../lib/types'
import Badge from '../../components/cavi/Badge'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'

const POR_PAGINA = 10

const COLS = '3fr 1.3fr 1.4fr 1fr 1.4fr'

// Estilo da pílula de status, espelhando o visual do design.
function estiloStatus(status: string): { cor: string; bg: string } {
  return status === StatusImovel.PUBLICADO
    ? { cor: colors.greenText, bg: '#e8f0e0' }
    : { cor: colors.muted, bg: colors.cream }
}

const btnAcao: React.CSSProperties = {
  padding: '8px 13px',
  border: `1px solid ${colors.field}`,
  background: '#fff',
  borderRadius: 9,
  fontSize: 13,
  fontWeight: 600,
  color: colors.muted,
  cursor: 'pointer',
}

export default function ImoveisListaPage() {
  const navigate = useNavigate()
  const pedirConfirmacao = useUIStore((s) => s.pedirConfirmacao)

  const [busca, setBusca] = useState('')
  const [buscaAplicada, setBuscaAplicada] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('') // '' = Todos
  const [pagina, setPagina] = useState(1)

  const carregar = useCallback(
    (signal: AbortSignal) =>
      api.get<PaginaResponse<ImovelResumo>>('/imoveis', {
        params: {
          pagina,
          por_pagina: POR_PAGINA,
          busca: buscaAplicada || undefined,
          status_publicacao: statusFiltro || undefined,
        },
        signal,
      }),
    [pagina, buscaAplicada, statusFiltro],
  )

  const { data, carregando, erro, recarregar } = useFetch(carregar, [
    pagina,
    buscaAplicada,
    statusFiltro,
  ])

  const lista = data?.items ?? []
  const total = data?.total ?? 0
  const totalPaginas = data?.total_paginas ?? 1

  function aplicarBusca(e: React.FormEvent) {
    e.preventDefault()
    setPagina(1)
    setBuscaAplicada(busca.trim())
  }

  function trocarStatus(valor: string) {
    setPagina(1)
    setStatusFiltro(valor)
  }

  async function alternarPublicacao(im: ImovelResumo) {
    try {
      await api.patch(`/imoveis/${im.id}/publicacao`)
      const publicando = im.status_publicacao !== StatusImovel.PUBLICADO
      toast.sucesso(publicando ? 'Imóvel publicado.' : 'Imóvel ocultado.')
      recarregar()
    } catch (e) {
      toast.erro(e instanceof Error ? e.message : 'Falha ao alterar publicação.')
    }
  }

  function confirmarExclusao(im: ImovelResumo) {
    pedirConfirmacao({
      titulo: 'Excluir imóvel',
      mensagem: `Deseja excluir "${im.titulo}"? Esta ação não pode ser desfeita.`,
      tipo: 'danger',
      textoConfirmar: 'Excluir',
      onConfirmar: async () => {
        try {
          await api.delete(`/imoveis/${im.id}`)
          toast.sucesso('Imóvel excluído.')
          // Se a página ficou vazia após excluir, recua uma página.
          if (lista.length === 1 && pagina > 1) setPagina((p) => p - 1)
          else recarregar()
        } catch (e) {
          toast.erro(e instanceof Error ? e.message : 'Falha ao excluir imóvel.')
        }
      },
    })
  }

  return (
    <div style={{ padding: '34px 44px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 26,
          gap: 16,
          flexWrap: 'wrap',
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
            }}
          >
            Meus imóveis
          </h1>
          <div style={{ fontSize: 14, color: colors.mutedSoft }}>
            {total} {total === 1 ? 'imóvel' : 'imóveis'}
          </div>
        </div>
        <button
          onClick={() => navigate('/app/imoveis/novo')}
          style={{
            background: colors.orange,
            color: '#fff',
            border: 'none',
            borderRadius: 11,
            padding: '13px 22px',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          + Novo imóvel
        </button>
      </div>

      <form onSubmit={aplicarBusca} style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.faint,
            }}
          >
            <span aria-hidden>⌕</span>
          </span>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título ou código"
            style={{
              width: '100%',
              padding: '12px 14px 12px 38px',
              border: `1px solid ${colors.field}`,
              borderRadius: 10,
              fontSize: 15,
              background: '#fff',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <select
          value={statusFiltro}
          onChange={(e) => trocarStatus(e.target.value)}
          style={{
            padding: '12px 14px',
            border: `1px solid ${colors.field}`,
            borderRadius: 10,
            fontSize: 15,
            background: '#fff',
            color: colors.ink,
            cursor: 'pointer',
          }}
        >
          <option value="">Todos</option>
          <option value={StatusImovel.PUBLICADO}>Publicados</option>
          <option value={StatusImovel.OCULTO}>Ocultos</option>
        </select>
        <button
          type="submit"
          style={{
            padding: '12px 20px',
            border: `1px solid ${colors.field}`,
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            background: '#fff',
            color: colors.ink,
            cursor: 'pointer',
          }}
        >
          Buscar
        </button>
      </form>

      <div
        style={{
          background: '#fff',
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: COLS,
            gap: 16,
            padding: '14px 22px',
            background: colors.bg,
            borderBottom: `1px solid ${colors.border}`,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            color: colors.faint,
          }}
        >
          <div>Imóvel</div>
          <div>Tipo</div>
          <div>Preço</div>
          <div>Status</div>
          <div style={{ textAlign: 'right' }}>Ações</div>
        </div>

        {carregando && <Spinner />}

        {!carregando && erro && (
          <div style={{ padding: '40px 22px', textAlign: 'center', color: colors.muted }}>
            <p style={{ marginBottom: 12 }}>Não foi possível carregar seus imóveis.</p>
            <button onClick={recarregar} style={btnAcao}>
              Tentar novamente
            </button>
          </div>
        )}

        {!carregando &&
          !erro &&
          lista.map((im) => {
            const st = estiloStatus(im.status_publicacao)
            const publicado = im.status_publicacao === StatusImovel.PUBLICADO
            return (
              <div
                key={im.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: COLS,
                  gap: 16,
                  padding: '14px 22px',
                  alignItems: 'center',
                  borderBottom: '1px solid #f4f0e7',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                  {im.foto_principal ? (
                    <img
                      src={im.foto_principal}
                      alt=""
                      style={{
                        width: 66,
                        height: 50,
                        objectFit: 'cover',
                        borderRadius: 8,
                        flex: 'none',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 66,
                        height: 50,
                        borderRadius: 8,
                        flex: 'none',
                        background: colors.cream,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.faint,
                      }}
                    >
                      <span aria-hidden>⌂</span>
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 15,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {im.titulo}
                    </div>
                    <div style={{ fontSize: 12, color: colors.faint }}>
                      {[im.codigo, im.bairro].filter(Boolean).join(' · ') || '—'}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 14, color: colors.muted }}>
                  {im.tipo}
                  <div style={{ fontSize: 12, color: colors.faint }}>{im.finalidade}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: colors.ink }}>
                  {formatarPrecoImovel(im.preco, im.finalidade)}
                </div>
                <div>
                  <Badge cor={st.cor} bg={st.bg}>
                    {im.status_publicacao}
                  </Badge>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => navigate(`/app/imoveis/${im.id}/editar`)} style={btnAcao}>
                    Editar
                  </button>
                  <button onClick={() => alternarPublicacao(im)} style={btnAcao}>
                    {publicado ? 'Ocultar' : 'Publicar'}
                  </button>
                  <button
                    onClick={() => confirmarExclusao(im)}
                    style={{ ...btnAcao, color: '#b4453a', borderColor: '#eccfca' }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            )
          })}

        {!carregando && !erro && !lista.length && (
          <div
            style={{ padding: '40px 22px', textAlign: 'center', color: colors.mutedSoft }}
          >
            {buscaAplicada || statusFiltro
              ? 'Nenhum imóvel encontrado com esses filtros.'
              : 'Você ainda não cadastrou imóveis.'}
          </div>
        )}
      </div>

      {!carregando && !erro && totalPaginas > 1 && (
        <div style={{ marginTop: 24 }}>
          <Pagination pagina={pagina} totalPaginas={totalPaginas} onPagina={setPagina} />
        </div>
      )}
    </div>
  )
}
