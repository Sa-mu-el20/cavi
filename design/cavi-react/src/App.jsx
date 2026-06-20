import { Routes, Route, Navigate } from 'react-router';
import Home from './pages/Home.jsx';
import Auth from './pages/Auth.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import SiteLayout from './layouts/SiteLayout.jsx';
import Catalog from './pages/Catalog.jsx';
import PropertyDetail from './pages/PropertyDetail.jsx';
import BrokerLayout from './layouts/BrokerLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Properties from './pages/Properties.jsx';
import PropertyForm from './pages/PropertyForm.jsx';
import Config from './pages/Config.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/recuperar-senha" element={<ForgotPassword />} />

      {/* Vitrine pública do corretor */}
      <Route path="/v/:slug" element={<SiteLayout />}>
        <Route index element={<Catalog />} />
        <Route path="imovel/:id" element={<PropertyDetail />} />
      </Route>

      {/* Painel do corretor */}
      <Route path="/app" element={<BrokerLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="imoveis" element={<Properties />} />
        <Route path="imoveis/novo" element={<PropertyForm />} />
        <Route path="imoveis/:id/editar" element={<PropertyForm />} />
        <Route path="config" element={<Config />} />
      </Route>

      {/* Administração da plataforma */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Admin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
