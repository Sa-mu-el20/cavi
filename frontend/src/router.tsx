import { createBrowserRouter } from 'react-router-dom'

import RootGate from './components/routing/RootGate'
import RouteError from './components/routing/RouteError'
import CorretorRoute from './components/routing/CorretorRoute'
import AdminRoute from './components/routing/AdminRoute'

// Layouts da estética CAVI
import SiteLayout from './components/layout/SiteLayout'
import BrokerLayout from './components/layout/BrokerLayout'
import AdminLayout from './components/layout/AdminLayout'

// Páginas públicas / institucionais
import HomePage from './pages/public/HomePage'
import CatalogosPage from './pages/public/CatalogosPage'
import NotFoundPage from './pages/public/NotFoundPage'

// Autenticação (login + auto-cadastro de corretor com alternância por abas)
import AuthPage from './pages/public/AuthPage'
import EsqueciSenhaPage from './pages/auth/EsqueciSenhaPage'
import RedefinirSenhaPage from './pages/auth/RedefinirSenhaPage'

// Catálogo público (/v/:slug)
import CatalogPage from './pages/catalogo/CatalogPage'
import PropertyDetailPage from './pages/catalogo/PropertyDetailPage'

// Painel do corretor (/app)
import DashboardCorretorPage from './pages/corretor/DashboardCorretorPage'
import ImoveisListaPage from './pages/corretor/ImoveisListaPage'
import ImovelFormPage from './pages/corretor/ImovelFormPage'
import ConfigSitePage from './pages/corretor/ConfigSitePage'
import EditPerfilPage from './pages/corretor/EditPerfilPage'

// Administração (/admin)
import AdminCorretoresPage from './pages/admin/AdminCorretoresPage'

export const router = createBrowserRouter([
  {
    element: <RootGate />,
    errorElement: <RouteError />,
    children: [
      // ===== Público / institucional =====
      { path: '/', element: <HomePage /> },
      { path: '/catalogos', element: <CatalogosPage /> },
      { path: '/login', element: <AuthPage /> },
      { path: '/esqueci-senha', element: <EsqueciSenhaPage /> },
      { path: '/redefinir-senha', element: <RedefinirSenhaPage /> },

      // ===== Catálogo público do corretor =====
      {
        path: '/v/:slug',
        element: <SiteLayout />,
        children: [
          { index: true, element: <CatalogPage /> },
          { path: 'imovel/:id', element: <PropertyDetailPage /> },
        ],
      },

      // ===== Painel do corretor =====
      {
        element: <CorretorRoute />,
        children: [
          {
            path: '/app',
            element: <BrokerLayout />,
            children: [
              { index: true, element: <DashboardCorretorPage /> },
              { path: 'imoveis', element: <ImoveisListaPage /> },
              { path: 'imoveis/novo', element: <ImovelFormPage /> },
              { path: 'imoveis/:id/editar', element: <ImovelFormPage /> },
              { path: 'config', element: <ConfigSitePage /> },
              { path: 'perfil', element: <EditPerfilPage /> },
            ],
          },
        ],
      },

      // ===== Administração da plataforma =====
      {
        element: <AdminRoute />,
        children: [
          {
            path: '/admin',
            element: <AdminLayout />,
            children: [{ index: true, element: <AdminCorretoresPage /> }],
          },
        ],
      },

      // ===== 404 =====
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
