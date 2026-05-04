import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Componente para proteger rotas
import PrivateRoute from "./PrivateRoute"; // Ajuste o caminho se necessário

// --- Páginas Públicas ---
import Login from "../paginas/login";
import ResetSenha from "../paginas/reset-senha";

// --- Páginas Protegidas ---
import Contratos from "../paginas/contratos";
import Cliente from "../paginas/cliente";
import Clientes from "../paginas/clientes";
import Gestao from "../paginas/gestao";
import FormSolucao from "../paginas/form-solucao";
import FormFabricante from "../paginas/form-fabricante";
import FormCliente from "../paginas/form-cliente";
import FormUsuario from "../paginas/form-usuario";
import FormContrato from "../paginas/form-contrato";
import Relatorios from "../paginas/relatorios";
import FormSegmento from "../paginas/form-segmento";
import FormFaturado from "../paginas/form-faturado";
import AuthCallback from "../paginas/microsoft-callback";
import FormGrupoEconomico from "../paginas/form-grupo-economico";
import GrupoEconomico from "../paginas/grupo-economico";
import FormClassificacaoClientes from "../paginas/form-classificacao-cliente";
import FormCategoriaProduto from "../paginas/form-categoria-produto";

export default function Rotas() {
  return (
    <Router>
      <Routes>
        {/* --- ROTAS PÚBLICAS --- */}
        {/* Rotas que não exigem login */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/reset-senha" element={<ResetSenha />} />

        {/* **2. ADICIONE A ROTA DE CALLBACK AQUI** */}
        {/* Esta rota também é pública, pois o usuário ainda não tem um cookie */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* --- ROTAS PRIVADAS --- */}
        {/* Todas as rotas abaixo só são acessíveis se o usuário estiver logado */}

        <Route element={<PrivateRoute />}>
          <Route path="/contratos" element={<Contratos />} />
          <Route path="/clientes/:id" element={<Cliente />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/relatorios/notificacoes" element={<Relatorios />} />
          <Route path="/relatorios/logs" element={<Relatorios />} />
          <Route
            path="/cadastro-solucao"
            element={<FormSolucao mode="cadastro" />}
          />
          <Route
            path="/edicao-solucao/:id"
            element={<FormSolucao mode="edicao" />}
          />
          <Route
            path="/cadastro-fabricante"
            element={<FormFabricante mode="cadastro" />}
          />
          <Route
            path="/edicao-fabricante/:id"
            element={<FormFabricante mode="edicao" />}
          />
          <Route
            path="/cadastro-cliente"
            element={<FormCliente mode="cadastro" />}
          />
          <Route
            path="/edicao-cliente/:id"
            element={<FormCliente mode="edicao" />}
          />
          {/* <Route
            path="/cadastro-usuario"
            element={<FormUsuario mode="cadastro" />}
          /> */}
          <Route
            path="/edicao-usuario/:id"
            element={<FormUsuario mode="edicao" />}
          />
          <Route
            path="/cadastro-contrato"
            element={<FormContrato mode="cadastro" />}
          />
          <Route
            path="/edicao-contrato/:id"
            element={<FormContrato mode="edicao" />}
          />
          <Route
            path="/cadastro-segmento"
            element={<FormSegmento mode="cadastro" />}
          />
          <Route
            path="/edicao-segmento/:id"
            element={<FormSegmento mode="edicao" />}
          />
          <Route
            path="/cadastro-faturado"
            element={<FormFaturado mode="cadastro" />}
          />
          <Route
            path="/edicao-faturado/:id"
            element={<FormFaturado mode="edicao" />}
          />
          <Route
            path="/cadastro-grupo-economico"
            element={<FormGrupoEconomico mode="cadastro" />}
          />
          <Route
            path="/edicao-grupo-economico/:id"
            element={<FormGrupoEconomico mode="edicao" />}
          />
          <Route path="/grupo-economico/:id" element={<GrupoEconomico />} />
          <Route
            path="/cadastro-classificacao"
            element={<FormClassificacaoClientes mode="cadastro" />}
          />
          <Route
            path="/edicao-classificacao/:id"
            element={<FormClassificacaoClientes mode="edicao" />}
          />
          <Route
            path="/cadastro-categoria-produto"
            element={<FormCategoriaProduto mode="cadastro" />}
          />
          <Route
            path="/edicao-categoria-produto/:id"
            element={<FormCategoriaProduto mode="edicao" />}
          />
        </Route>

        {/* --- ROTAS DE ADMIN --- */}
        {/* Rota que exige um tipo de usuário específico */}
        <Route element={<PrivateRoute cargosPermitidos={["admin", "dev"]} />}>
          <Route path="/gestao" element={<Gestao />} />
        </Route>
      </Routes>
    </Router>
  );
}
