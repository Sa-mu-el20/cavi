// Detalhe público de um imóvel (/v/:slug/imovel/:id).
// Porte de cavi-react/src/pages/PropertyDetail.jsx, ligado à API real:
// GET /api/publico/imoveis/{id} -> ImovelPublicoDetalhe ({ imovel, vitrine }).
// Galeria de fotos, características, endereço e botão WhatsApp com mensagem pré-pronta.
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useFetch } from '../../hooks/useFetch'
import { colors, fonts } from '../../lib/theme'
import { formatarPrecoImovel, formatarArea, linkWhatsApp, urlMidia } from '../../lib/format'
import { FinalidadeImovel } from '../../lib/types'
import type { EnderecoImovel, ImovelPublicoDetalhe } from '../../lib/types'
import { useVitrine } from '../../components/layout/SiteLayout'
import Avatar from '../../components/cavi/Avatar'
import Badge from '../../components/cavi/Badge'

// Estilo de pílula por finalidade (presentation-only). Porte de finalidadeStyle.
function finalidadeStyle(finalidade: string): { cor: string; bg: string } {
  return finalidade === FinalidadeImovel.VENDA
    ? { cor: '#d97a2b', bg: '#fbeedd' }
    : { cor: '#5a8f7b', bg: '#e2efe6' }
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.borderSoft}`,
        borderRadius: 12,
        padding: 18,
      }}
    >
      <div style={{ fontSize: 13, color: colors.mutedSoft, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 500 }}>{value}</div>
    </div>
  )
}

function montarEnderecoMapa(end?: EnderecoImovel | null): string {
  if (!end) return ''
  const ruaNumero = [end.logradouro, end.numero].filter(Boolean).join(', ')
  return [ruaNumero, end.bairro, end.cidade, end.uf, end.cep, 'Brasil'].filter(Boolean).join(', ')
}

export default function PropertyDetailPage() {
  const { id, slug } = useParams()
  const { slug: ctxSlug } = useVitrine()
  const navigate = useNavigate()
  const [idx, setIdx] = useState(0)

  const { data, carregando, erro } = useFetch<ImovelPublicoDetalhe>(
    (signal) => api.get<ImovelPublicoDetalhe>(`/publico/imoveis/${id}`, { signal }),
    [id],
  )

  const baseSlug = slug || ctxSlug

  if (carregando) {
    return (
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '60px 40px', color: colors.mutedSoft }}>
        Carregando imóvel…
      </div>
    )
  }

  if (erro || !data) {
    return (
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '60px 40px', color: colors.mutedSoft }}>
        Imóvel não encontrado.
      </div>
    )
  }

  const { imovel: im, vitrine } = data
  const fin = finalidadeStyle(im.finalidade)

  // Galeria: ordena por `ordem`, priorizando a foto principal. Fallback para placeholder.
  const fotos = [...(im.fotos ?? [])].sort((a, b) => {
    if (a.foto_principal !== b.foto_principal) return a.foto_principal ? -1 : 1
    return a.ordem - b.ordem
  })
  const temFotos = fotos.length > 0
  const idxSeguro = Math.min(idx, Math.max(fotos.length - 1, 0))
  const mainSrc = temFotos ? urlMidia(fotos[idxSeguro].url_arquivo) : undefined

  const end = im.endereco
  const linhaEndereco = end
    ? [
        [end.logradouro, end.numero].filter(Boolean).join(', '),
        [end.bairro, [end.cidade, end.uf].filter(Boolean).join('/')].filter(Boolean).join(' — '),
      ]
        .filter(Boolean)
        .join(' — ')
    : ''

  const localResumo = end ? [end.bairro, end.cidade].filter(Boolean).join(', ') : ''
  const enderecoMapa = montarEnderecoMapa(end)
  const urlMapa = enderecoMapa
    ? `https://www.google.com/maps?q=${encodeURIComponent(enderecoMapa)}&output=embed`
    : ''
  const urlMapaExterno = enderecoMapa
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoMapa)}`
    : ''

  const msg = `Olá! Tenho interesse no imóvel ${im.codigo ?? `#${im.id}`} — ${im.titulo}`
  const wa = linkWhatsApp(vitrine.whatsapp, msg)

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 40px 0' }}>
      <div style={{ fontSize: 14, color: colors.mutedSoft, marginBottom: 20 }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/v/${baseSlug}`)}>
          Imóveis
        </span>
        &nbsp;/&nbsp; <span style={{ color: colors.muted }}>{im.titulo}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 40, alignItems: 'start' }}>
        <div>
          <div
            style={{
              borderRadius: 18,
              overflow: 'hidden',
              border: `1px solid ${colors.border}`,
              marginBottom: 14,
            }}
          >
            {mainSrc ? (
              <img
                src={mainSrc}
                alt={im.titulo}
                style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: 420,
                  background: colors.cream,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.faint,
                  fontSize: 14,
                }}
              >
                sem foto
              </div>
            )}
          </div>
          {fotos.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {fotos.map((foto, i) => (
                <img
                  key={foto.id}
                  src={urlMidia(foto.url_arquivo)}
                  alt={foto.legenda ?? im.titulo}
                  onClick={() => setIdx(i)}
                  style={{
                    width: '100%',
                    height: 84,
                    objectFit: 'cover',
                    borderRadius: 10,
                    cursor: 'pointer',
                    border: i === idxSeguro ? `2px solid ${colors.orange}` : '2px solid transparent',
                    opacity: i === idxSeguro ? 1 : 0.7,
                  }}
                />
              ))}
            </div>
          )}

          <div style={{ marginTop: 36 }}>
            <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 24, margin: '0 0 14px' }}>
              Sobre o imóvel
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: '#5b564d', margin: '0 0 28px' }}>
              {im.descricao || 'Sem descrição disponível.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              <StatBox label="Área" value={formatarArea(im.area)} />
              <StatBox label="Quartos" value={im.quartos ?? 0} />
              <StatBox label="Banheiros" value={im.banheiros ?? 0} />
              <StatBox label="Vagas" value={im.vagas ?? 0} />
            </div>
          </div>

          {end && (
            <div style={{ marginTop: 36 }}>
              <h2 style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 24, margin: '0 0 14px' }}>
                Localização
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 16,
                  color: '#5b564d',
                  marginBottom: 16,
                }}
              >
                <span style={{ color: colors.orange }}>⚲</span> {linhaEndereco || '—'}
              </div>
              {urlMapa ? (
                <div
                  style={{
                    borderRadius: 14,
                    border: `1px solid ${colors.border}`,
                    overflow: 'hidden',
                    background: colors.cream,
                  }}
                >
                  <iframe
                    title={`Mapa de ${linhaEndereco || im.titulo}`}
                    src={urlMapa}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    style={{
                      width: '100%',
                      height: 260,
                      border: 0,
                      display: 'block',
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      padding: '10px 12px',
                      borderTop: `1px solid ${colors.borderSoft}`,
                      background: '#fff',
                    }}
                  >
                    <a
                      href={urlMapaExterno}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: colors.orange,
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      Abrir no Google Maps
                    </a>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    borderRadius: 14,
                    border: `1px solid ${colors.border}`,
                    background: colors.cream,
                    padding: 28,
                    color: colors.mutedSoft,
                    fontSize: 14,
                  }}
                >
                  Endereço insuficiente para exibir o mapa.
                </div>
              )}
            </div>
          )}
        </div>

        <aside style={{ position: 'sticky', top: 96 }}>
          <div
            style={{
              background: '#fff',
              border: `1px solid ${colors.border}`,
              borderRadius: 18,
              padding: 26,
              boxShadow: '0 16px 40px -26px rgba(60,45,25,0.35)',
            }}
          >
            <Badge cor={fin.cor} bg={fin.bg} style={{ padding: '5px 11px', marginBottom: 14 }}>
              {im.finalidade}
            </Badge>
            <div
              style={{
                fontFamily: fonts.display,
                fontWeight: 600,
                fontSize: 34,
                letterSpacing: -0.5,
                marginBottom: 6,
              }}
            >
              {formatarPrecoImovel(im.preco, im.finalidade)}
            </div>
            <h1 style={{ fontWeight: 600, fontSize: 20, lineHeight: 1.35, margin: '0 0 6px' }}>{im.titulo}</h1>
            {localResumo && (
              <div style={{ fontSize: 14, color: colors.mutedSoft, marginBottom: 8 }}>{localResumo}</div>
            )}
            {im.codigo && (
              <div style={{ fontSize: 12, color: colors.faint, marginBottom: 22 }}>Código {im.codigo}</div>
            )}
            {vitrine.whatsapp && (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  background: colors.green,
                  color: colors.greenDark,
                  textDecoration: 'none',
                  borderRadius: 12,
                  padding: 15,
                  fontWeight: 700,
                  fontSize: 16,
                  marginBottom: 12,
                }}
              >
                Falar no WhatsApp
              </a>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginTop: 24,
                paddingTop: 22,
                borderTop: `1px solid ${colors.borderSoft}`,
              }}
            >
              <Avatar corretor={vitrine} size={46} radius={11} fontSize={19} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{vitrine.nome_publico}</div>
                {vitrine.creci && (
                  <div style={{ fontSize: 13, color: colors.mutedSoft }}>{vitrine.creci}</div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
