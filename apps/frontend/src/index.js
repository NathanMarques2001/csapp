import React from "react";
import ReactDOM from "react-dom/client";
import "./style/global.css";
import "./style/medias.css";
import Rotas from "./rotas/Rotas";
// Bibliotecas
// Componentes
// Estilos, funcoes, classes, imagens e etc

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Rotas />
  </React.StrictMode>
);
