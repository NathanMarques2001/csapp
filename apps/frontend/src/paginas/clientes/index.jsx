import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../componentes/navbar";
import Carregando from "../../componentes/carregando";
import PopUpFiltroClientes from "../../componentes/pop-up-filtro-clientes";
import imgQuestao from "../../assets/images/questao.png";
import "./style.css";

import { useClientes } from "../../hooks/useClientes";
import TabelaClientes from "./TabelaClientes";

export default function Clientes() {
  const navigate = useNavigate();
  const [mostrarFiltro, setMostrarFiltro] = useState(false);

  const {
    carregando,
    filtros,
    dados,
    funcoes
  } = useClientes();

  const { valores: valoresFiltro, setValores: setValoresFiltro, busca, setBusca, limpar: limparFiltros } = filtros;
  const { clientesGrupos, clientesSemGrupo, vendedores, classificacoes, totais } = dados;
  const { isAdminOuDev } = funcoes;

  return (
    <>
      {carregando && <Carregando />}

      {mostrarFiltro && (
        <PopUpFiltroClientes
          onFilter={(novosFiltros) => {
            setValoresFiltro(novosFiltros);
            setMostrarFiltro(false);
          }}
          closeModal={() => setMostrarFiltro(false)}
          classificacoes={classificacoes}
          vendedores={vendedores}
        />
      )}

      <div id="clientes-display">
        <Navbar />
        <div id="clientes-container">
          <h1 id="clientes-titulo">Clientes</h1>

          {/* Header (Busca e Botões) */}
          <div id="header-clientes">
            <input
              type="text"
              placeholder="Procure pelo nome"
              id="clientes-input"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <button
              disabled={!isAdminOuDev}
              className={`clientes-botao${!isAdminOuDev ? " disabled" : ""}`}
              onClick={() => navigate("/cadastro-cliente")}
              id="clientes-add-edit-botao"
            >
              Adicionar cliente
            </button>

            <button
              className="clientes-botao"
              id="clientes-filtrar"
              onClick={() => setMostrarFiltro(true)}
            >
              Filtrar
            </button>

            {/* Tooltip */}
            <div id="tooltip-container">
              <img id="img-top30" src={imgQuestao} alt="ajuda" />
              <span id="tooltip-text">
                Categoria TOP 30: 30 Maiores faturamentos <br />
                Categoria A: Faturamento acima de R$ 3.000,00 <br />
                Categoria B: Faturamento acima de R$ 2.000,00 <br />
                Categoria C: Faturamento até R$ 1.999,00
              </span>
            </div>
          </div>

          {/* Filtros Ativos */}
          {Object.keys(valoresFiltro).length > 0 && (valoresFiltro.status !== "ativo" || Object.keys(valoresFiltro).length > 1) && (
            <div className="active-filters">
              <p><b>Filtros Ativos:</b></p>
              <p id="active-filters-container">
                {Object.entries(valoresFiltro).map(([chave, valor]) => {
                  if (!valor) return null;
                  let valorExibido = valor;
                  if (chave === "classificacao_cliente") valorExibido = classificacoes[valor]?.nome || valor;
                  if (chave === "nome_vendedor") valorExibido = vendedores[valor] || valor;

                  return (
                    <span className="active-filters-current" key={chave}>
                      {`${chave.replace(/_/g, " ")}: ${valorExibido}`}
                    </span>
                  );
                })}
              </p>
              <button onClick={limparFiltros} className="contratos-botao" id="contratos-botao-limpar-filtros">
                Limpar Filtros
              </button>
            </div>
          )}

          {/* Tabela */}
          <TabelaClientes
            clientesGrupos={clientesGrupos}
            clientesSemGrupo={clientesSemGrupo}
            vendedores={vendedores}
            classificacoes={classificacoes}
            totais={totais}
            funcoes={funcoes}
          />

        </div>
      </div>
    </>
  );
}