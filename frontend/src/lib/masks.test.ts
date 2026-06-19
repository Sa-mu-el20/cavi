import { describe, expect, it } from 'vitest'
import {
  formatarNumeroComoMoedaInput,
  mascararCpf,
  mascararMoeda,
  mascararTelefone,
  moedaParaNumero,
} from './masks'

describe('mascararCpf', () => {
  it('mantem apenas 11 digitos e aplica pontuacao de CPF', () => {
    expect(mascararCpf('12345678901')).toBe('123.456.789-01')
    expect(mascararCpf('123.456.789-0199')).toBe('123.456.789-01')
  })
})

describe('mascararTelefone', () => {
  it('formata telefone fixo e celular brasileiros', () => {
    expect(mascararTelefone('1133334444')).toBe('(11) 3333-4444')
    expect(mascararTelefone('11988887777')).toBe('(11) 98888-7777')
  })
})

describe('mascararMoeda', () => {
  it('interpreta os digitos como centavos e aplica separadores brasileiros', () => {
    expect(mascararMoeda('1')).toBe('0,01')
    expect(mascararMoeda('123456789')).toBe('1.234.567,89')
  })

  it('formata numero carregado da API e converte input mascarado para numero', () => {
    expect(formatarNumeroComoMoedaInput(890000)).toBe('890.000,00')
    expect(moedaParaNumero('890.000,00')).toBe(890000)
  })
})
