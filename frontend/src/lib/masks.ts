const moedaFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

export function mascararCpf(valor: string): string {
  const digitos = apenasDigitos(valor).slice(0, 11)

  if (digitos.length <= 3) return digitos
  if (digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`
  if (digitos.length <= 9) {
    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`
  }
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`
}

export function mascararTelefone(valor: string): string {
  const digitos = apenasDigitos(valor).slice(0, 11)

  if (!digitos) return ''
  if (digitos.length <= 2) return `(${digitos}`
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
}

export function mascararMoeda(valor: string): string {
  const digitos = apenasDigitos(valor)
  if (!digitos) return ''

  return moedaFormatter.format(Number.parseInt(digitos, 10) / 100)
}

export function formatarNumeroComoMoedaInput(valor?: number | null): string {
  if (valor == null || !Number.isFinite(valor)) return ''
  return moedaFormatter.format(valor)
}

export function moedaParaNumero(valor: string): number | undefined {
  const digitos = apenasDigitos(valor)
  if (!digitos) return undefined

  return Number((Number.parseInt(digitos, 10) / 100).toFixed(2))
}
