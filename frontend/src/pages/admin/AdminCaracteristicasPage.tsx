// Administração de comodidades (/admin/caracteristicas): lista + criar/editar/excluir.
// API: GET/POST /api/admin/caracteristicas, PUT/DELETE /api/admin/caracteristicas/{id}.
import { useState } from 'react'
import { api, ApiError } from '../../lib/api'
import type { Caracteristica } from '../../lib/types'
import { caracteristicaSchema } from '../../lib/schemas'
import { useFetch } from '../../hooks/useFetch'
import { toast, useUIStore } from '../../store/uiStore'
import { colors, fonts } from '../../lib/theme'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

export default function AdminCaracteristicasPage() {
  const pedirConfirmacao = useUIStore((s) => s.pedirConfirmacao)

  const { data, carregando, erro, recarregar } = useFetch<Caracteristica[]>(
    (signal) => api.get('/admin/caracteristicas', { signal }),
    [],
  )

  // Estado do formulário (criar ou editar).
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [nome, setNome] = useState('')
  const [icone, setIcone] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})

  function limparForm() {
    setEditandoId(null)
    setNome('')
    setIcone('')
    setErros({})
  }

  function editar(c: Caracteristica) {
    setEditandoId(c.id)
    setNome(c.nome)
    setIcone(c.icone ?? '')
    setErros({})
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    const payload = { nome: nome.trim(), icone: icone.trim() || undefined }
    const parsed = caracteristicaSchema.safeParse(payload)
    if (!parsed.success) {
      const novos: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const chave = String(issue.path[0] ?? '')
        if (chave && !novos[chave]) novos[chave] = issue.message
      }
      setErros(novos)
      toast.erro('Revise os campos destacados.')
      return
    }

    setSalvando(true)
    try {
      if (editandoId) {
        await api.put(`/admin/caracteristicas/${editandoId}`, parsed.data)
        toast.sucesso('Comodidade atualizada.')
      } else {
        await api.post('/admin/caracteristicas', parsed.data)
        toast.sucesso('Comodidade criada.')
      }
      limparForm()
      recarregar()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const novos: Record<string, string> = {}
          for (const [campo, msgs] of Object.entries(err.errors)) {
            if (msgs?.[0]) novos[campo] = msgs[0]
          }
          setErros(novos)
        }
        toast.erro(err.message)
      } else {
        toast.erro('Erro ao salvar a comodidade.')
      }
    } finally {
      setSalvando(false)
    }
  }

  function excluir(c: Caracteristica) {
    pedirConfirmacao({
      titulo: 'Excluir comodidade',
      mensagem: `Deseja excluir "${c.nome}"? Ela será removida de todos os imóveis.`,
      tipo: 'danger',
      textoConfirmar: 'Excluir',
      onConfirmar: async () => {
        try {
          await api.delete(`/admin/caracteristicas/${c.id}`)
          toast.sucesso('Comodidade excluída.')
          if (editandoId === c.id) limparForm()
          recarregar()
        } catch (err) {
          toast.erro(err instanceof ApiError ? err.message : 'Erro ao excluir a comodidade.')
        }
      },
    })
  }

  const itens = data ?? []

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    border: `1px solid ${colors.field}`,
    borderRadius: 10,
    fontSize: 15,
    background: '#fff',
    boxSizing: 'border-box' as const,
    fontFamily: fonts.body,
  }

  return (
    <div style={{ padding: '34px 44px', maxWidth: 820 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: fonts.display, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: '0 0 4px' }}>
          Comodidades
        </h1>
        <div style={{ fontSize: 14, color: colors.mutedSoft }}>
          Cadastre as comodidades que os corretores podem marcar nos imóveis.
        </div>
      </div>

      {/* Formulário criar/editar */}
      <form
        onSubmit={salvar}
        style={{
          background: '#fff',
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          padding: 24,
          marginBottom: 26,
          display: 'flex',
          gap: 14,
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.muted, marginBottom: 6 }}>
            Nome
          </label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Piscina"
            maxLength={60}
            style={{ ...inputStyle, borderColor: erros.nome ? '#e0a89e' : colors.field }}
          />
          {erros.nome && <div style={{ color: '#c0392b', fontSize: 12.5, marginTop: 5 }}>{erros.nome}</div>}
        </div>
        <div style={{ width: 120 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.muted, marginBottom: 6 }}>
            Ícone
          </label>
          <input
            value={icone}
            onChange={(e) => setIcone(e.target.value)}
            placeholder="🏊"
            maxLength={20}
            style={{ ...inputStyle, borderColor: erros.icone ? '#e0a89e' : colors.field }}
          />
        </div>
        <button
          type="submit"
          disabled={salvando}
          style={{
            padding: '12px 22px',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            color: '#fff',
            background: colors.orange,
            cursor: salvando ? 'wait' : 'pointer',
            fontFamily: fonts.body,
          }}
        >
          {salvando ? 'Salvando...' : editandoId ? 'Salvar' : 'Adicionar'}
        </button>
        {editandoId && (
          <button
            type="button"
            onClick={limparForm}
            style={{
              padding: '12px 18px',
              border: `1px solid ${colors.field}`,
              background: '#fff',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              color: colors.muted,
              cursor: 'pointer',
              fontFamily: fonts.body,
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      {/* Lista */}
      <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, overflow: 'hidden' }}>
        {carregando ? (
          <div style={{ padding: 32 }}>
            <Spinner />
          </div>
        ) : erro ? (
          <div style={{ padding: 24, color: colors.muted }}>{erro.message}</div>
        ) : itens.length === 0 ? (
          <div style={{ padding: 32 }}>
            <EmptyState
              icon="✦"
              titulo="Nenhuma comodidade"
              mensagem="Cadastre a primeira comodidade no formulário acima."
            />
          </div>
        ) : (
          itens.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 22px',
                borderBottom: '1px solid #f4f0e7',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{c.icone || '✦'}</span>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{c.nome}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => editar(c)}
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
                  Editar
                </button>
                <button
                  onClick={() => excluir(c)}
                  style={{
                    padding: '8px 13px',
                    border: 'none',
                    background: colors.bg,
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#c0392b',
                    cursor: 'pointer',
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}