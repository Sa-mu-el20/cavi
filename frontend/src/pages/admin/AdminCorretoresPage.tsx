// Administração de corretores (/admin): lista paginada de catálogos com
// ativar/desativar. Layout portado de cavi-react/src/pages/Admin.jsx, ligado
// à API real (GET /api/admin/corretores, PATCH /api/admin/corretores/{id}/status).
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, ApiError } from '../../lib/api'
import type { CorretorAdmin, PaginaResponse } from '../../lib/types'
import { StatusConta } from '../../lib/types'
import { useFetch } from '../../hooks/useFetch'
import { toast, useUIStore } from '../../store/uiStore'
import { colors, fonts } from '../../lib/theme'
import StatCard from '../../components/cavi/StatCard'
import Avatar from '../../components/cavi/Avatar'
import Badge from '../../components/cavi/Badge'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'

const POR_PAGINA = 10

function statusStyle(status: string): { cor: string; bg: string } {
  return status === StatusConta.ATIVO
    ? { cor: colors.greenText, bg: '#e7f0df' }
    : { cor: colors.mutedSoft, bg: colors.cream }
}

export default function AdminCorretoresPage() {
  const navigate = useNavigate()
  const pedirConfirmacao = useUIStore((s) => s.pedirConfirmacao)
  const [searchParams, setSearchParams] = useSearchParams()

  const pagina = Number(searchParams.get('pagina')) || 1
  const statusFiltro = searchParams.get('status') ?? ''
  const q = searchParams.get('q') ?? ''

  const [busca, setBusca] = useState(q)

  const { data, carregando, erro, recarregar } = useFetch<PaginaResponse<CorretorAdmin>>(
    (signal) =>
      api.get('/admin/corretores', {
        params: {
          pagina,
          por_pagina: POR_PAGINA,
          q: q || undefined,
          status_filtro: statusFiltro || undefined,
        },
        signal,
      }),
    [pagina, statusFiltro, q],
  )

  function atualizarParams(next: Record<string, string | number | undefined>) {
    const params: Record<string, string> = {}
    if (q) params.q = q
    if (statusFiltro) params.status = statusFiltro
    if (pagina > 1) params.pagina = String(pagina)
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined || v === '' || v === 0) delete params[k]
      else params[k] = String(v)
    }
    setSearchParams(params)
  }

  function aplicarBusca(e: React.FormEvent) {
    e.preventDefault()
    atualizarParams({ q: busca.trim() || undefined, pagina: undefined })
  }

  function alternarStatus(c: CorretorAdmin) {
    const ativo = c.status === StatusConta.ATIVO
    const novoStatus = ativo ? StatusConta.INATIVO : StatusConta.ATIVO
    pedirConfirmacao({
      titulo: ativo ? 'Desativar catálogo' : 'Ativar catálogo',
      mensagem: ativo
        ? `Deseja desativar o catálogo de ${c.nome_publico}? Ele deixará de aparecer publicamente.`
        : `Deseja reativar o catálogo de ${c.nome_publico}?`,
      detalhes: c.usuario_email ?? undefined,
      tipo: ativo ? 'danger' : 'warning',
      textoConfirmar: ativo ? 'Desativar' : 'Ativar',
      onConfirmar: async () => {
        try {
          await api.patch(`/admin/corretores/${c.conta_id}/status`, { status: novoStatus })
          toast.sucesso(ativo ? 'Catálogo desativado.' : 'Catálogo ativado.')
          recarregar()
        } catch (e) {
          toast.erro(e instanceof ApiError ? e.message : 'Erro ao alterar o status do catálogo.')
        }
      },
    })
  }

  const itens = data?.items ?? []
  const cols = '2.6fr 1.4fr 0.9fr 1fr 1.5fr'

  return (
    <div style={{ padding: '34px 44px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: fonts.display,
            fontWeight: 400,
            fontSize: 32,
            lineHeight: 1.15,
            margin: '0 0 4px',
          }}
        >
          Corretores cadastrados
        </h1>
        <div style={{ fontSize: 14, color: colors.mutedSoft }}>
          Acompanhe as contas criadas na plataforma.
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 20,
          marginBottom: 30,
        }}
      >
        <StatCard label="Catálogos (página)" value={itens.length} />
        <StatCard
          label="Contas ativas (página)"
          value={itens.filter((c) => c.status === StatusConta.ATIVO).length}
          valueColor={colors.greenText}
        />
        <StatCard
          label="Imóveis publicados (página)"
          value={itens.reduce((a, c) => a + c.qtd_imoveis, 0)}
          valueColor={colors.orangeDeep}
        />
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
            ⌕
          </span>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar corretor, e-mail ou cidade"
            style={{
              width: '100%',
              padding: '12px 14px 12px 38px',
              border: `1px solid ${colors.field}`,
              borderRadius: 10,
              fontSize: 15,
              background: '#fff',
            }}
          />
        </div>
        <select
          value={statusFiltro}
          onChange={(e) => atualizarParams({ status: e.target.value || undefined, pagina: undefined })}
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
          <option value="">Todos os status</option>
          <option value={StatusConta.ATIVO}>Ativo</option>
          <option value={StatusConta.INATIVO}>Inativo</option>
        </select>
        <button
          type="submit"
          style={{
            padding: '12px 20px',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            color: '#fff',
            background: colors.orange,
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
            gridTemplateColumns: cols,
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
          <div>Catálogo / Corretor</div>
          <div>Cidade</div>
          <div>Imóveis</div>
          <div>Status</div>
          <div style={{ textAlign: 'right' }}>Ação</div>
        </div>

        {carregando ? (
          <div style={{ padding: 32 }}>
            <Spinner />
          </div>
        ) : erro ? (
          <div style={{ padding: 24, color: colors.muted }}>{erro.message}</div>
        ) : itens.length === 0 ? (
          <div style={{ padding: 32 }}>
            <EmptyState
              icon="◳"
              titulo="Nenhum corretor encontrado"
              mensagem="Nenhum catálogo corresponde aos filtros aplicados."
            />
          </div>
        ) : (
          itens.map((c) => {
            const st = statusStyle(c.status)
            const ativo = c.status === StatusConta.ATIVO
            const local = [c.cidade, c.uf].filter(Boolean).join(' / ') || '-'
            return (
              <div
                key={c.conta_id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: cols,
                  gap: 16,
                  padding: '14px 22px',
                  alignItems: 'center',
                  borderBottom: '1px solid #f4f0e7',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 13, minWidth: 0 }}>
                  <Avatar
                    corretor={{ nome_publico: c.nome_publico, cor: colors.orange }}
                    size={42}
                    radius={10}
                    fontSize={18}
                  />
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
                      {c.nome_publico}
                    </div>
                    <div style={{ fontSize: 12, color: colors.faint }}>
                      {c.usuario_nome || c.usuario_email || c.slug}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 14, color: colors.muted }}>{local}</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{c.qtd_imoveis}</div>
                <div>
                  <Badge cor={st.cor} bg={st.bg}>
                    {c.status}
                  </Badge>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => navigate(`/v/${c.slug}`)}
                    style={{
                      padding: '8px 13px',
                      border: `1px solid ${colors.field}`,
                      background: '#fff',
                      borderRadius: 9,
                      fontSize: 13,
                      fontWeight: 600,
                      color: colors.muted,
                      cursor: 'pointer',
                    }}
                  >
                    Catálogo
                  </button>
                  <button
                    onClick={() => alternarStatus(c)}
                    style={{
                      padding: '8px 13px',
                      border: 'none',
                      background: colors.bg,
                      borderRadius: 9,
                      fontSize: 13,
                      fontWeight: 600,
                      color: st.cor,
                      cursor: 'pointer',
                    }}
                  >
                    {ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {data && data.total_paginas > 1 && (
        <div
          style={{
            marginTop: 18,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <small style={{ color: colors.faint }}>Total: {data.total} corretor(es)</small>
          <Pagination
            pagina={data.pagina}
            totalPaginas={data.total_paginas}
            onPagina={(p) => atualizarParams({ pagina: p })}
          />
        </div>
      )}
    </div>
  )
}
