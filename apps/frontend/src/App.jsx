import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from './components/auth/PrivateRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientForm from './pages/ClientForm';
import Contracts from './pages/Contracts';
import ContractForm from './pages/ContractForm';
import ClientDetails from './pages/ClientDetails';
import EconomicGroupDetails from './pages/EconomicGroupDetails';

import Solutions from './pages/Solutions';
import Reports from './pages/Reports';
import Management from './pages/Management';
import Settings from './pages/Settings';
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (Wrapper) */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="clients/novo" element={<ClientForm />} />
            <Route path="clients/editar/:id" element={<ClientForm />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clientes" element={<Clients />} />
            <Route path="grupo-economico/:id" element={<EconomicGroupDetails />} />
            <Route path="clientes/novo" element={<ClientForm />} />
            <Route path="clientes/:id/editar" element={<ClientForm />} />
            <Route path="clientes/:id" element={<ClientDetails />} />
            <Route path="contratos" element={<Contracts />} />
            <Route path="contratos" element={<Contracts />} />
            <Route path="contratos/novo" element={<ContractForm />} />
            <Route path="contratos/:id/editar" element={<ContractForm />} />
            <Route path="solucoes" element={<Solutions />} />
            <Route path="relatorios" element={<Reports />} />
            <Route path="gestao" element={<Management />} />
            <Route path="configuracoes" element={<Settings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter >
  );
}
