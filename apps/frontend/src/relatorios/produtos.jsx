import { useState } from "react";
import Excel from "../utils/excel";
import Popup from "../componentes/pop-up";

export default function RelatorioProdutos({ produtos, fabricantesMap }) {
  const excel = new Excel("Relatório de Produtos");
  const [filtros, setFiltros] = useState({
    nome: "",
    fabricante: "",
    status: "",
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [abrirPopup, setAbrirPopup] = useState(false);

  const produtosFiltrados = produtos.filter(
    (produto) =>
      (!filtros.nome || produto.nome.includes(filtros.nome)) &&
      (!filtros.fabricante ||
        fabricantesMap[produto.id_fabricante]?.nome === filtros.fabricante) &&
      (!filtros.status || produto.status === filtros.status)
  );

  const dadosExportacao = produtosFiltrados.map((produto) => ({
    Nome: produto.nome,
    Fabricante: fabricantesMap[produto.id_fabricante]?.nome || "Desconhecido",
    Status: produto.status,
  }));

  const baixarRelatorio = (e) => {
    e.preventDefault();
    excel.exportToExcel(dadosExportacao);
    setAbrirPopup(false);
  };

  const aoMudarFiltro = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  return (
    <>
      {abrirPopup && (
        <Popup
          title="Exportar Produtos"
          message="Tem certeza que deseja exportar o relatório de produtos?"
          onConfirm={baixarRelatorio}
          onCancel={() => setAbrirPopup(false)}
        />
      )}

      {mostrarFiltros && (
        <div id="filter-container">
          <form onSubmit={(e) => e.preventDefault()} className="filter-form">
            <div className="form-group">
              <label>Produto:</label>
              <select
                name="nome"
                value={filtros.nome}
                onChange={aoMudarFiltro}
              >
                <option value="">Selecione</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.nome}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Fabricante:</label>
              <select
                name="fabricante"
                value={filtros.fabricante}
                onChange={aoMudarFiltro}
              >
                <option value="">Selecione</option>
                {Object.values(fabricantesMap).map((f) => (
                  <option key={f.id} value={f.nome}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Status:</label>
              <select
                name="status"
                value={filtros.status}
                onChange={aoMudarFiltro}
              >
                <option value="">Selecione</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setMostrarFiltros(false)}
              id="filter-close-button"
              className="filter-button"
            >
              Fechar
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setMostrarFiltros(true)}
        className="relatorio-button"
        id="relatorio-button-filtrar"
      >
        Filtrar
      </button>
      <button
        onClick={() => setAbrirPopup(true)}
        className="relatorio-button"
        id="relatorio-button-exportar"
      >
        Exportar para Excel
      </button>

      <table className="global-tabela">
        <thead>
          <tr>
            <th className="global-titulo-tabela">Nome</th>
            <th className="global-titulo-tabela">Fabricante</th>
            <th className="global-titulo-tabela">Status</th>
          </tr>
        </thead>
        <tbody>
          {dadosExportacao.map((p, i) => (
            <tr key={i}>
              <td className="global-conteudo-tabela">{p["Nome"]}</td>
              <td className="global-conteudo-tabela">{p["Fabricante"]}</td>
              <td className="global-conteudo-tabela">{p["Status"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
