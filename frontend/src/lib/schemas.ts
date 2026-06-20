// Schemas Zod reutilizáveis para validação de formulários.
import { z } from 'zod'
import { Perfil, StatusImovel, FinalidadeImovel, TipoImovel } from './types'

// UFs brasileiras válidas (espelha _UFS_VALIDAS do backend).
const UFS_VALIDAS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const

/** Regras de senha forte (espelham validar_senha_forte do backend). */
export const senhaSchema = z
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Z]/, 'A senha deve conter pelo menos 1 letra maiúscula')
  .regex(/[a-z]/, 'A senha deve conter pelo menos 1 letra minúscula')
  .regex(/[0-9]/, 'A senha deve conter pelo menos 1 número')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'A senha deve conter ao menos um caractere especial.')

export const emailSchema = z.string().min(1, 'Informe o e-mail').email('E-mail inválido')

export const loginSchema = z.object({
  email: emailSchema,
  senha: z.string().min(1, 'Informe a senha'),
})
export type LoginForm = z.infer<typeof loginSchema>

const nomePessoaSchema = z
  .string()
  .min(4, 'O nome deve ter no mínimo 4 caracteres')
  .max(128, 'O nome deve ter no máximo 128 caracteres')
  .refine((v) => v.trim().split(/\s+/).length >= 2, 'Informe nome e sobrenome.')

const ufSchema = z
  .string()
  .min(1, 'Informe a UF')
  .transform((v) => v.trim().toUpperCase())
  .refine(
    (v): v is (typeof UFS_VALIDAS)[number] => (UFS_VALIDAS as readonly string[]).includes(v),
    'UF inválida. Use a sigla de 2 letras (ex: ES, SP).',
  )

const nomeUsuarioSchema = z
  .string()
  .min(4, 'O nome deve ter no mínimo 4 caracteres')
  .max(100, 'O nome deve ter no máximo 100 caracteres')
  .refine((v) => v.trim().split(/\s+/).length >= 2, 'Informe nome e sobrenome.')

const perfilAdminSchema = z.enum([Perfil.ADMIN, Perfil.CORRETOR], {
  message: 'Selecione um perfil',
})

export const adminUsuarioCadastroSchema = z.object({
  nome: nomeUsuarioSchema,
  email: emailSchema,
  senha: senhaSchema,
  perfil: perfilAdminSchema,
})
export type AdminUsuarioCadastroForm = z.infer<typeof adminUsuarioCadastroSchema>

export const adminUsuarioEdicaoSchema = z.object({
  nome: nomeUsuarioSchema,
  email: emailSchema,
  perfil: perfilAdminSchema,
})
export type AdminUsuarioEdicaoForm = z.infer<typeof adminUsuarioEdicaoSchema>

export const esqueciSenhaSchema = z.object({
  email: emailSchema,
})
export type EsqueciSenhaForm = z.infer<typeof esqueciSenhaSchema>

export const redefinirSenhaSchema = z
  .object({
    senha: senhaSchema,
    confirmar_senha: z.string().min(1, 'Confirme a senha'),
  })
  .refine((d) => d.senha === d.confirmar_senha, {
    message: 'As senhas não coincidem',
    path: ['confirmar_senha'],
  })
export type RedefinirSenhaForm = z.infer<typeof redefinirSenhaSchema>

// ===== Helpers de domínio (CPF/telefone/whatsapp/cor) =====

/** Valida CPF com dígitos verificadores (espelha validar_cpf do backend). */
function cpfValido(valor: string): boolean {
  const cpf = valor.replace(/\D/g, '')
  if (cpf.length !== 11) return false
  if (cpf === cpf[0].repeat(11)) return false
  const digito = (base: string, peso: number): number => {
    let soma = 0
    for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (peso - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  const d1 = digito(cpf.slice(0, 9), 10)
  const d2 = digito(cpf.slice(0, 10), 11)
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10])
}

export const cpfSchema = z
  .string()
  .min(1, 'Informe o CPF')
  .refine((v) => cpfValido(v), 'CPF inválido.')

export const telefoneSchema = z
  .string()
  .min(1, 'Informe o telefone')
  .refine(
    (v) => [10, 11].includes(v.replace(/\D/g, '').length),
    'Telefone deve ter 10 ou 11 dígitos.',
  )

/** WhatsApp opcional: vazio vira undefined; se informado, 10 ou 11 dígitos. */
const whatsappOpcionalSchema = z
  .string()
  .optional()
  .transform((v) => {
    const t = (v ?? '').trim()
    return t === '' ? undefined : t
  })
  .refine(
    (v) => v === undefined || [10, 11].includes(v.replace(/\D/g, '').length),
    'WhatsApp deve ter 10 ou 11 dígitos.',
  )

/** Cor hexadecimal (#rgb ou #rrggbb), espelha _HEX_COR_REGEX do backend. */
export const corSchema = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Cor deve ser um hexadecimal válido (ex: #d97a2b).')

const creciSchema = z
  .string()
  .min(2, 'O CRECI deve ter no mínimo 2 caracteres')
  .max(30, 'O CRECI deve ter no máximo 30 caracteres')

const nomePublicoSchema = z
  .string()
  .min(3, 'O nome público deve ter no mínimo 3 caracteres')
  .max(120, 'O nome público deve ter no máximo 120 caracteres')

// ===== Cadastro de corretor (espelha CadastroCorretorDTO) =====
export const cadastroCorretorSchema = z.object({
  // Dados do usuário/corretor
  nome: nomePessoaSchema,
  email: emailSchema,
  senha: senhaSchema,
  cpf: cpfSchema,
  telefone: telefoneSchema,
  creci: creciSchema,
  // Dados da vitrine (ContaSite)
  nome_publico: nomePublicoSchema,
  cidade: z
    .string()
    .min(2, 'A cidade deve ter no mínimo 2 caracteres')
    .max(120, 'A cidade deve ter no máximo 120 caracteres'),
  uf: ufSchema,
  whatsapp: whatsappOpcionalSchema,
})
export type CadastroCorretorForm = z.infer<typeof cadastroCorretorSchema>

// ===== Edição da ContaSite (espelha ContaSiteDTO) =====
// O slug é opcional (derivado do nome quando omitido) e o status NÃO é
// gerenciado por este formulário (fluxo admin de ativar/inativar).
export const contaSiteSchema = z.object({
  nome_publico: nomePublicoSchema,
  slug: z
    .string()
    .max(128, 'O slug deve ter no máximo 128 caracteres')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug deve conter apenas letras minúsculas, números e hífens.',
    )
    .optional()
    .or(z.literal('')),
  descricao: z.string().max(2000, 'A descrição deve ter no máximo 2000 caracteres').optional(),
  whatsapp: whatsappOpcionalSchema,
  creci: z.string().max(30, 'O CRECI deve ter no máximo 30 caracteres').optional(),
  cidade: z.string().max(120, 'A cidade deve ter no máximo 120 caracteres').optional(),
  uf: ufSchema.optional(),
  bairro: z.string().max(100, 'O bairro deve ter no máximo 100 caracteres').optional(),
  cor: corSchema,
})
export type ContaSiteForm = z.infer<typeof contaSiteSchema>

// ===== Endereço do imóvel (aninhado, todos opcionais — espelha EnderecoImovelDTO) =====
const ufEnderecoSchema = z
  .string()
  .transform((v) => v.trim().toUpperCase())
  .refine((v) => v === '' || (v.length === 2 && /^[A-Z]{2}$/.test(v)), 'UF deve ter exatamente 2 letras.')
  .optional()
  .or(z.literal(''))

export const enderecoImovelSchema = z.object({
  cep: z.string().optional(),
  logradouro: z.string().max(200, 'O logradouro deve ter no máximo 200 caracteres').optional(),
  numero: z.string().optional(),
  bairro: z.string().max(100, 'O bairro deve ter no máximo 100 caracteres').optional(),
  cidade: z.string().max(100, 'A cidade deve ter no máximo 100 caracteres').optional(),
  uf: ufEnderecoSchema,
  complemento: z.string().max(200, 'O complemento deve ter no máximo 200 caracteres').optional(),
})
export type EnderecoImovelForm = z.infer<typeof enderecoImovelSchema>

// ===== Criação/edição de imóvel (espelha _ImovelBaseDTO) =====
// Inteiros opcionais 0..100; preço/área > 0. coerce p/ inputs numéricos.
const inteiro0a100 = (campo: string) =>
  z.coerce
    .number({ message: `${campo} deve ser um número.` })
    .int(`${campo} deve ser um inteiro.`)
    .min(0, `${campo} deve ser no mínimo 0.`)
    .max(100, `${campo} deve ser no máximo 100.`)
    .optional()

export const imovelSchema = z.object({
  titulo: z
    .string()
    .min(5, 'O título deve ter no mínimo 5 caracteres')
    .max(200, 'O título deve ter no máximo 200 caracteres'),
  tipo: z.enum(
    [
      TipoImovel.APARTAMENTO,
      TipoImovel.CASA,
      TipoImovel.STUDIO,
      TipoImovel.COBERTURA,
      TipoImovel.LOFT,
      TipoImovel.SALA_COMERCIAL,
      TipoImovel.TERRENO,
    ],
    { message: 'Selecione o tipo do imóvel' },
  ),
  finalidade: z.enum([FinalidadeImovel.VENDA, FinalidadeImovel.ALUGUEL], {
    message: 'Selecione a finalidade',
  }),
  preco: z.coerce
    .number({ message: 'Informe o preço.' })
    .positive('Preço deve ser maior que zero.'),
  codigo: z.string().max(50, 'O código deve ter no máximo 50 caracteres').optional(),
  descricao: z.string().max(5000, 'A descrição deve ter no máximo 5000 caracteres').optional(),
  area: z.coerce
    .number({ message: 'Área deve ser um número.' })
    .positive('Área deve ser maior que zero.')
    .optional(),
  quartos: inteiro0a100('Quartos'),
  banheiros: inteiro0a100('Banheiros'),
  vagas: inteiro0a100('Vagas'),
  destaque: z.boolean().default(false),
  status_publicacao: z
    .enum([StatusImovel.PUBLICADO, StatusImovel.OCULTO], {
      message: 'Selecione o status de publicação',
    })
    .default(StatusImovel.OCULTO),
  endereco: enderecoImovelSchema.optional(),
})
export type ImovelForm = z.infer<typeof imovelSchema>

// ===== Filtros do catálogo (espelha query params de listar_imoveis_da_vitrine) =====
// Todos opcionais; valores vazios são omitidos da query pelo cliente HTTP.
export const filtrosCatalogoSchema = z.object({
  finalidade: z.enum([FinalidadeImovel.VENDA, FinalidadeImovel.ALUGUEL]).optional(),
  tipo: z
    .enum([
      TipoImovel.APARTAMENTO,
      TipoImovel.CASA,
      TipoImovel.STUDIO,
      TipoImovel.COBERTURA,
      TipoImovel.LOFT,
      TipoImovel.SALA_COMERCIAL,
      TipoImovel.TERRENO,
    ])
    .optional(),
  bairro: z.string().max(100).optional(),
  preco_min: z.coerce.number().nonnegative('Preço mínimo inválido.').optional(),
  preco_max: z.coerce.number().nonnegative('Preço máximo inválido.').optional(),
  pagina: z.coerce.number().int().min(1).optional(),
  por_pagina: z.coerce.number().int().min(1).max(100).optional(),
})
export type FiltrosCatalogoForm = z.infer<typeof filtrosCatalogoSchema>
