import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../componentes/navbar";
import "./style.css";
import Solucoes from "../solucoes";
import Usuarios from "../usuarios";
import Fabricantes from "../fabricantes";
import Segmentos from "../segmentos";
import Faturados from "../faturados";
import GruposEconomicos from "../grupos-economicos";
import ClassificacoesClientes from "../classificacoes-clientes";
import CategoriasProdutos from "../categorias-produtos";
// Bibliotecas
// Componentes
// Estilos, funcoes, classes, imagens e etc

export default function Gestao() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const aba = queryParams.get("aba") || "categorias-produtos";

  const [itemSelecionado, setItemSelecionado] = useState(aba);

  const selecionarItem = (item) => {
    setItemSelecionado(item);
  };

  useEffect(() => {
    setItemSelecionado(aba);
  }, [aba]);

  return (
    <div id="gestao-display">
      <Navbar />
      <div id="gestao-container">
        <h1 id="central-gestao-titulo">Central de Gestão</h1>
        <div id="central-gestao-switch-container">
          <p
            className={`switch-item ${itemSelecionado === "categorias-produtos" ? "active" : ""}`}
            onClick={() => selecionarItem("categorias-produtos")}
          >
            Categorias
            <br />
            Produtos/Serviços
          </p>
          <p
            className={`switch-item ${itemSelecionado === "classificacoes-clientes" ? "active" : ""}`}
            onClick={() => selecionarItem("classificacoes-clientes")}
          >
            Classificações
            <br />
            Clientes
          </p>
          <p
            className={`switch-item ${itemSelecionado === "grupos-economicos" ? "active" : ""}`}
            onClick={() => selecionarItem("grupos-economicos")}
          >
            Grupos
            <br />
            Econômicos
          </p>
          <p
            className={`switch-item ${itemSelecionado === "faturados" ? "active" : ""}`}
            onClick={() => selecionarItem("faturados")}
          >
            Faturista
          </p>
          <p
            className={`switch-item ${itemSelecionado === "fabricantes" ? "active" : ""}`}
            onClick={() => selecionarItem("fabricantes")}
          >
            Fornecedores
          </p>
          <p
            className={`switch-item ${itemSelecionado === "segmentos" ? "active" : ""}`}
            onClick={() => selecionarItem("segmentos")}
          >
            Segmentos
          </p>
          <p
            className={`switch-item ${itemSelecionado === "solucoes" ? "active" : ""}`}
            onClick={() => selecionarItem("solucoes")}
          >
            Produtos/Serviços
          </p>
          <p
            className={`switch-item ${itemSelecionado === "usuarios" ? "active" : ""}`}
            onClick={() => selecionarItem("usuarios")}
          >
            Usuários
          </p>
        </div>

        <div>
          {itemSelecionado === "categorias-produtos" && <CategoriasProdutos />}
          {itemSelecionado === "classificacoes-clientes" && (
            <ClassificacoesClientes />
          )}
          {itemSelecionado === "grupos-economicos" && <GruposEconomicos />}
          {itemSelecionado === "usuarios" && <Usuarios />}
          {itemSelecionado === "solucoes" && <Solucoes />}
          {itemSelecionado === "fabricantes" && <Fabricantes />}
          {itemSelecionado === "segmentos" && <Segmentos />}
          {itemSelecionado === "faturados" && <Faturados />}
        </div>
      </div>
    </div>
  );
}
