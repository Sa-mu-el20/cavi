import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TextField, SelectField } from './Field'

describe('TextField', () => {
  it('renderiza label associado e chama onChange', () => {
    const onChange = vi.fn()
    render(<TextField label="Nome" name="nome" value="" onChange={onChange} />)
    const input = screen.getByLabelText('Nome')
    fireEvent.change(input, { target: { value: 'João' } })
    expect(onChange).toHaveBeenCalledWith('João')
  })

  it('exibe erro e aplica borda de erro no input', () => {
    render(<TextField label="Email" name="email" value="x" onChange={() => {}} erro="E-mail inválido" />)
    expect(screen.getByText('E-mail inválido')).toBeInTheDocument()
    // Borda vermelha de erro aplicada via estilo inline (CSS-in-JS, sem Bootstrap).
    // jsdom serializa #c0392b como rgb(192, 57, 43).
    expect(screen.getByLabelText('Email').getAttribute('style')).toContain('rgb(192, 57, 43)')
  })

  it('mostra ajuda quando não há erro', () => {
    render(<TextField label="Senha" name="senha" value="" onChange={() => {}} ajuda="Mín. 8 caracteres" />)
    expect(screen.getByText('Mín. 8 caracteres')).toBeInTheDocument()
  })
})

describe('SelectField', () => {
  it('renderiza opções e propaga a seleção', () => {
    const onChange = vi.fn()
    render(
      <SelectField
        label="Perfil"
        name="perfil"
        value="Cliente"
        onChange={onChange}
        opcoes={[
          { valor: 'Cliente', rotulo: 'Cliente' },
          { valor: 'Administrador', rotulo: 'Administrador' },
        ]}
      />,
    )
    const select = screen.getByLabelText('Perfil')
    expect(screen.getByRole('option', { name: 'Administrador' })).toBeInTheDocument()
    fireEvent.change(select, { target: { value: 'Administrador' } })
    expect(onChange).toHaveBeenCalledWith('Administrador')
  })
})
