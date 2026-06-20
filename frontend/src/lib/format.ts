// Formatadores de exibição (datas e moeda) no padrão brasileiro.

const TZ = 'America/Sao_Paulo'

/** ISO 8601 -> "dd/mm/aaaa". */
export function formatarData(iso?: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('pt-BR', { timeZone: TZ })
}

/** ISO 8601 -> "dd/mm/aaaa HH:MM". */
export function formatarDataHora(iso?: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleString('pt-BR', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** ISO 8601 -> "HH:MM". */
export function formatarHora(iso?: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleTimeString('pt-BR', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Número -> "R$ 1.234,56". */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/**
 * Preço de imóvel no estilo da vitrine CAVI: "R$ 1.250.000" (sem centavos),
 * com sufixo "/mês" quando a finalidade é Aluguel. Porte de fmtPreco do design.
 */
export function formatarPrecoImovel(preco: number, finalidade?: string | null): string {
  const base = 'R$ ' + Number(preco).toLocaleString('pt-BR', { maximumFractionDigits: 0 })
  return finalidade === 'Aluguel' ? base + '/mês' : base
}

/** Área em m²: "120 m²" (vazio/nulo -> "-"). */
export function formatarArea(area?: number | null): string {
  if (area == null) return '-'
  return `${Number(area).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} m²`
}

/** Monta link wa.me a partir de um número (com DDI 55). Porte de waLink. */
export function linkWhatsApp(numero?: string | null, msg?: string): string {
  const d = String(numero ?? '').replace(/\D/g, '')
  return 'https://wa.me/55' + d + (msg ? '?text=' + encodeURIComponent(msg) : '')
}

/** Bytes -> "1,2 MB". */
export function formatarBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  return `${(mb / 1024).toFixed(1)} GB`
}
