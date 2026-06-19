import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

// Exige usuário autenticado E perfil Corretor.
// Sem sessão ou sem o perfil Corretor, redireciona para /login.
export default function CorretorRoute() {
  const usuario = useAuthStore((s) => s.usuario)
  const isCorretor = useAuthStore((s) => s.isCorretor())

  if (!usuario) return <Navigate to="/login" replace />
  if (!isCorretor) return <Navigate to="/login" replace />
  return <Outlet />
}
