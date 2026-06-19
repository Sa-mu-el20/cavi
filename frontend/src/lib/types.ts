// Tipos TypeScript espelhando os schemas de resposta do backend (dtos/responses/).
// Enums são strings de valor (ex: "Aberto", "Administrador"), nunca índices.

// ===== Enums de domínio =====
export const Perfil = {
  ADMIN: 'Administrador',
  CORRETOR: 'Corretor',
} as const
export type PerfilValor = (typeof Perfil)[keyof typeof Perfil]

// ===== Enums de domínio imobiliário (espelham model/imovel_model.py) =====
export const StatusImovel = {
  PUBLICADO: 'Publicado',
  OCULTO: 'Oculto',
} as const
export type StatusImovelValor = (typeof StatusImovel)[keyof typeof StatusImovel]

export const FinalidadeImovel = {
  VENDA: 'Venda',
  ALUGUEL: 'Aluguel',
} as const
export type FinalidadeImovelValor = (typeof FinalidadeImovel)[keyof typeof FinalidadeImovel]

export const TipoImovel = {
  APARTAMENTO: 'Apartamento',
  CASA: 'Casa',
  STUDIO: 'Studio',
  COBERTURA: 'Cobertura',
  LOFT: 'Loft',
  SALA_COMERCIAL: 'Sala comercial',
  TERRENO: 'Terreno',
} as const
export type TipoImovelValor = (typeof TipoImovel)[keyof typeof TipoImovel]

export const StatusConta = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
} as const
export type StatusContaValor = (typeof StatusConta)[keyof typeof StatusConta]

// ===== Comuns =====
export interface MensagemResponse {
  message: string
}
export interface TokenCsrfResponse {
  token: string
}
export interface PaginaResponse<T> {
  items: T[]
  pagina: number
  por_pagina: number
  total: number
  total_paginas: number
}

// ===== Usuário =====
export interface Usuario {
  id: number
  nome: string
  email: string
  perfil: string
  foto_url: string
  data_cadastro?: string | null
  data_atualizacao?: string | null
}

// ===== ContaSite (catálogo do corretor) =====
// Espelha backend/dtos/responses/conta_site_response.py: ContaSiteResponse.
export interface ContaSite {
  id: number
  usuario_id: number
  nome_publico: string
  slug: string
  descricao?: string | null
  whatsapp?: string | null
  creci?: string | null
  cidade?: string | null
  uf?: string | null
  bairro?: string | null
  cor: string
  logo?: string | null
  status: string
  data_cadastro?: string | null
  data_atualizacao?: string | null
  usuario_nome?: string | null
  usuario_email?: string | null
}

// Espelha CorretorAdminResponse (listagem administrativa de corretores).
export interface CorretorAdmin {
  conta_id: number
  usuario_id: number
  usuario_nome?: string | null
  usuario_email?: string | null
  nome_publico: string
  slug: string
  cidade?: string | null
  uf?: string | null
  status: string
  qtd_imoveis: number
  data_cadastro?: string | null
  data_atualizacao?: string | null
}

// Espelha ContaSiteResumoResponse (resumo público de catálogo).
export interface ContaSiteResumo {
  nome_publico: string
  slug: string
  descricao?: string | null
  cidade?: string | null
  uf?: string | null
  bairro?: string | null
  cor: string
  logo?: string | null
}

// ===== Imóvel =====
// Espelha backend/dtos/responses/imovel_response.py.
export interface EnderecoImovel {
  id: number
  imovel_id: number
  cep?: string | null
  logradouro?: string | null
  numero?: string | null
  bairro?: string | null
  cidade?: string | null
  uf?: string | null
  complemento?: string | null
}

export interface FotoImovel {
  id: number
  imovel_id: number
  url_arquivo: string
  ordem: number
  foto_principal: boolean
  legenda?: string | null
}

export interface Imovel {
  id: number
  conta_site_id: number
  codigo?: string | null
  titulo: string
  slug?: string | null
  descricao?: string | null
  tipo: string
  finalidade: string
  preco: number
  area?: number | null
  quartos?: number | null
  banheiros?: number | null
  vagas?: number | null
  destaque: boolean
  status_publicacao: string
  data_cadastro?: string | null
  data_atualizacao?: string | null
  endereco?: EnderecoImovel | null
  fotos: FotoImovel[]
}

// Espelha ImovelResumoResponse (cards/listagens).
export interface ImovelResumo {
  id: number
  conta_site_id: number
  codigo?: string | null
  titulo: string
  slug?: string | null
  tipo: string
  finalidade: string
  preco: number
  area?: number | null
  quartos?: number | null
  banheiros?: number | null
  vagas?: number | null
  destaque: boolean
  status_publicacao: string
  bairro?: string | null
  cidade?: string | null
  foto_principal?: string | null
}

// ===== Endpoints públicos do catálogo (publico_response.py) =====
// Espelha CorretorCatalogoResponse (card de corretor na Home).
export interface CorretorCatalogo {
  nome_publico: string
  slug: string
  descricao?: string | null
  cidade?: string | null
  uf?: string | null
  bairro?: string | null
  whatsapp?: string | null
  creci?: string | null
  cor: string
  logo?: string | null
  qtd_imoveis_publicados: number
}

// Espelha CatalogoPublicoResponse (cabeçalho de /v/{slug}).
export interface CatalogoPublico {
  nome_publico: string
  slug: string
  descricao?: string | null
  whatsapp?: string | null
  creci?: string | null
  cidade?: string | null
  uf?: string | null
  bairro?: string | null
  cor: string
  logo?: string | null
}

// Espelha ImovelPublicoDetalheResponse (detalhe público + dados do catálogo).
export interface ImovelPublicoDetalhe {
  imovel: Imovel
  catalogo: CatalogoPublico
}
