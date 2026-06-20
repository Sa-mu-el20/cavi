import { describe, expect, it } from 'vitest'
import { montarEnderecoMapa, montarUrlMapaEmbed, montarUrlMapaExterno } from './PropertyDetailPage'
import type { EnderecoImovel } from '../../lib/types'

describe('mapa do detalhe do imóvel', () => {
  const endereco: EnderecoImovel = {
    id: 1,
    imovel_id: 10,
    logradouro: 'Rua Hélio Marconi',
    numero: '55',
    bairro: 'Mata da Praia',
    cidade: 'Vitória',
    uf: 'ES',
    cep: '29065-200',
  }

  it('monta o endereço usado no Google Maps', () => {
    expect(montarEnderecoMapa(endereco)).toBe(
      'Rua Hélio Marconi, 55, Mata da Praia, Vitória, ES, 29065-200, Brasil',
    )
  })

  it('usa URL embed permitida para iframe', () => {
    const enderecoMapa = montarEnderecoMapa(endereco)

    expect(montarUrlMapaEmbed(enderecoMapa)).toBe(
      `https://maps.google.com/maps?q=${encodeURIComponent(enderecoMapa)}&output=embed`,
    )
  })

  it('mantém URL externa de busca do Google Maps', () => {
    const enderecoMapa = montarEnderecoMapa(endereco)

    expect(montarUrlMapaExterno(enderecoMapa)).toBe(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoMapa)}`,
    )
  })
})
