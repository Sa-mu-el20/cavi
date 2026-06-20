import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Toasts from '../ui/Toasts'
import AlertModal from '../ui/AlertModal'
import ConfirmModal from '../ui/ConfirmModal'
import { colors } from '../../lib/theme'

// Componente raiz: verifica a sessão (GET /api/me) uma vez no boot e
// segura a renderização até saber se há usuário logado.
export default function RootGate() {
  const carregando = useAuthStore((s) => s.carregando)
  const carregarSessao = useAuthStore((s) => s.carregarSessao)

  useEffect(() => {
    carregarSessao()
  }, [carregarSessao])

  if (carregando) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.bg,
        }}
      >
        <span
          role="status"
          aria-label="Carregando..."
          style={{
            display: 'inline-block',
            width: 42,
            height: 42,
            border: `3px solid ${colors.border}`,
            borderTopColor: colors.orange,
            borderRadius: '50%',
            animation: 'cavi-spin 0.7s linear infinite',
          }}
        />
      </div>
    )
  }

  return (
    <>
      <Outlet />
      <Toasts />
      <AlertModal />
      <ConfirmModal />
    </>
  )
}
