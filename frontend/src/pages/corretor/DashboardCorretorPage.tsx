// Painel do corretor (/app). Porte de cavi-react/src/pages/Dashboard.jsx,
// ligado aos endpoints reais:
//   GET /api/imoveis/dashboard  -> { total, publicados, ocultos }
//   GET /api/minha-conta        -> ContaSite (nome público + slug da vitrine)
//   GET /api/imoveis            -> PaginaResponse<ImovelResumo> (imóveis recentes)
import { Link, useNavigate } from 'react-router-dom'

import Badge from '../../components/cavi/Badge'
import StatCard from '../../components/cavi/StatCard'
import Spinner from '../../components/ui/Spinner'
import { useFetch } from '../../hooks/useFetch'
import { api } from '../../lib/api'
import { formatarPrecoImovel, urlMidia } from '../../lib/format'
import { useAuthStore } from '../../store/authStore'
import { colors, fonts } from '../../lib/theme'
import { StatusImovel } from '../../lib/types'
import type { ContaSite, ImovelResumo, PaginaResponse } from '../../lib/types'

interface ImoveisDashboard {
  total: number
  publicados: number
  ocultos: number
}

// Estilo de pílula por status de publicação (Publicado x Oculto).
function statusImovelStyle(status: string): { cor: string; bg: string } {
  return status === StatusImovel.PUBLICADO
    ? { cor: colors.greenText, bg: '#e6eed6' }
    : { cor: '#8a8275', bg: colors.borderSoft }
}

export default function DashboardCorretorPage() {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)

  const { data: contadores, carregando: carregandoContadores } = useFetch<ImoveisDashboard>(
    (signal) => api.get<ImoveisDashboard>('/imoveis/dashboard', { signal }),
    [],
  )

  const { data: conta } = useFetch<ContaSite>(
    (signal) => api.get<ContaSite>('/minha-conta', { signal }),
    [],
  )

  const { data: recentesPagina } = useFetch<PaginaResponse<ImovelResumo>>(
    (signal) => api.get<PaginaResponse<ImovelResumo>>('/imoveis', {
      params: { pagina: 1, por_pagina: 4 },
      signal,
    }),
    [],
  )

  const primeiroNome = (usuario?.nome ?? '').split(' ')[0]
  const slug = conta?.slug
  const recentes = recentesPagina?.items ?? []

  const atalho = (icon: string, label: string, onClick: () => void) => (
    <div
      key={label}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 13,
        border: `1px solid ${colors.borderSoft}`,
        borderRadius: 11,
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: 15,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.orange)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.borderSoft)}
    >
      <span style={{ color: colors.orange, fontSize: 18 }}>{icon}</span> {label}
    </div>
  )

  if (carregandoContadores) {
    return (
      <div style={{ padding: '34px 44px' }}>
        <Spinner texto="Carregando painel..." />
      </div>
    )
  }

  const total = contadores?.total ?? 0
  const publicados = contadores?.publicados ?? 0
  const ocultos = contadores?.ocultos ?? 0

  return (
    <div style={{ padding: '34px 44px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 30,
        }}
      >
        <div>
          <div style={{ fontSize: 14, color: colors.mutedSoft, marginBottom: 4 }}>
            Bom dia{primeiroNome ? `, ${primeiroNome}` : ''} 👋
          </div>
          <h1 style={{ fontFamily: fonts.display, fontWeight: 400, fontSize: 32, lineHeight: 1.1, margin: 0 }}>
            Painel
          </h1>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard label="Imóveis" value={total} />
        <StatCard label="Publicados" value={publicados} valueColor={colors.greenText} />
        <StatCard label="Ocultos" value={ocultos} valueColor="#a89f90" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
        <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 24 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 18,
            }}
          >
            <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 20, margin: 0 }}>
              Imóveis recentes
            </h2>
            <Link
              to="/app/imoveis"
              style={{ fontSize: 14, color: colors.orange, fontWeight: 600, textDecoration: 'none' }}
            >
              Ver todos →
            </Link>
          </div>
          {recentes.length === 0 ? (
            <p style={{ color: colors.mutedSoft, fontSize: 14, margin: 0 }}>
              Você ainda não cadastrou nenhum imóvel.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recentes.map((im) => {
                const st = statusImovelStyle(im.status_publicacao)
                const local = [im.bairro, im.cidade].filter(Boolean).join(' · ')
                return (
                  <div
                    key={im.id}
                    onClick={() => navigate(`/app/imoveis/${im.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: 12,
                      borderRadius: 12,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = colors.bg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {im.foto_principal ? (
                      <img
                        src={urlMidia(im.foto_principal)}
                        alt={im.titulo}
                        style={{ width: 62, height: 48, objectFit: 'cover', borderRadius: 8, flex: 'none' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 62,
                          height: 48,
                          borderRadius: 8,
                          flex: 'none',
                          background: colors.cream,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colors.faint,
                          fontSize: 18,
                        }}
                      >
                        <span aria-hidden>◳</span>
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
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
                      <div style={{ fontSize: 13, color: colors.mutedSoft }}>
                        {formatarPrecoImovel(im.preco, im.finalidade)}
                        {local ? ` · ${local}` : ''}
                      </div>
                    </div>
                    <Badge cor={st.cor} bg={st.bg} style={{ flex: 'none' }}>
                      {im.status_publicacao}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 20, margin: '0 0 16px' }}>
              Atalhos
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {atalho('＋', 'Cadastrar imóvel', () => navigate('/app/imoveis/novo'))}
              {atalho('🏠', 'Meus imóveis', () => navigate('/app/imoveis'))}
              {atalho('⚙', 'Configurar meu site', () => navigate('/app/config'))}
              {slug &&
                atalho('↗', 'Ver minha vitrine', () => navigate(`/v/${slug}`))}
            </div>
          </div>

          {slug && (
            <div style={{ background: '#e6eed6', border: '1px solid #d6e2c0', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 14, color: colors.greenText, fontWeight: 600, marginBottom: 8 }}>
                Sua vitrine
              </div>
              <div
                style={{
                  fontFamily: fonts.display,
                  fontSize: 22,
                  fontWeight: 500,
                  lineHeight: 1.1,
                  color: colors.ink,
                }}
              >
                {conta?.nome_publico}
              </div>
              <Link
                to={`/v/${slug}`}
                style={{
                  display: 'inline-block',
                  marginTop: 10,
                  fontSize: 13,
                  color: '#6f7d56',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                /v/{slug} →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
