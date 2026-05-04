import Excel from "../utils/excel";
import { useState } from "react";
import Popup from "../componentes/pop-up";

export default function RelatorioClientes({
  clientes,
  contratos,
  usuariosMap,
  segmentosMap,
  gruposEconomicosMap,
  classificacoesClientesMap,
}) {
  const excel = new Excel("Relatório de Clientes");
  const [filtros, setFiltros] = useState({
    nome_fantasia: "",
    tipo: "",
    status: "",
    vendedor: "",
    segmento: "",
    grupo_economico: "",
    pertence_grupo: "",
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [abrirPopup, setAbrirPopup] = useState(false);

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      (!filtros.nome_fantasia ||
        cliente.nome_fantasia.includes(filtros.nome_fantasia)) &&
      (!filtros.tipo || cliente.tipo === filtros.tipo) &&
      (!filtros.status || cliente.status === filtros.status) &&
      (!filtros.vendedor ||
        usuariosMap[cliente.id_usuario]?.nome === filtros.vendedor) &&
      (!filtros.segmento ||
        segmentosMap[cliente.id_segmento]?.nome === filtros.segmento)
      && (!filtros.grupo_economico || gruposEconomicosMap[cliente.id_grupo_economico]?.nome === filtros.grupo_economico)
      && (!filtros.pertence_grupo || ((cliente.id_grupo_economico && gruposEconomicosMap[cliente.id_grupo_economico]) ? 'sim' : 'não') === filtros.pertence_grupo)
  );

  const dadosExportacao = clientesFiltrados.map((cliente) => {
    const contratosCliente = contratos.filter(
      (contrato) =>
        contrato.id_cliente === cliente.id && contrato.status === "ativo"
    );

    const valorTotalContratos = contratosCliente.reduce((soma, contrato) => {
      const valor = parseFloat(contrato.valor_mensal);
      const indice = contrato.indice_reajuste || 0;
      return soma + valor;
    }, 0);

    return {
      "Nome Fantasia": cliente.nome_fantasia,
      "CPF/CNPJ": cliente.cpf_cnpj,
      "Grupo Econômico": gruposEconomicosMap[cliente.id_grupo_economico]?.nome || "",
      Tipo:
        classificacoesClientesMap[
          gruposEconomicosMap[cliente.id_grupo_economico]
            ?.id_classificacao_cliente
        ]?.nome ||
        classificacoesClientesMap[cliente.id_classificacao_cliente]?.nome ||
        "Desconhecido",
      Status: cliente.status,
      "Usuário Responsável": usuariosMap[cliente.id_usuario]?.nome || "Desconhecido",
      Segmento: segmentosMap[cliente.id_segmento]?.nome || "Desconhecido",
      "Valor Total dos Contratos": valorTotalContratos,
      "Pertence Grupo Econômico": cliente.id_grupo_economico && gruposEconomicosMap[cliente.id_grupo_economico] ? "sim" : "não"
    };
  }).sort((a, b) => b["Valor Total dos Contratos"] - a["Valor Total dos Contratos"]);


  console.log(gruposEconomicosMap);
  console.log(classificacoesClientesMap);
  console.log(clientes);

  function baixarRelatorio(e) {
    e.preventDefault();
    excel.exportToExcel(dadosExportacao);
    setAbrirPopup(false);
  }

  function aoMudarFiltro(e) {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  }

  return (
    <>
      {abrirPopup && (
        <Popup
          title="Exportar Clientes"
          message="Tem certeza que deseja exportar o relatório de clientes?"
          onConfirm={baixarRelatorio}
          onCancel={() => setAbrirPopup(false)}
        />
      )}

      {mostrarFiltros && (
        <div id="filter-container">
          <form onSubmit={(e) => e.preventDefault()} className="filter-form">
            <div className="form-group">
              <label>Razão Social:</label>
              <select
                name="nome_fantasia"
                value={filtros.nome_fantasia}
                onChange={aoMudarFiltro}
              >
                <option value="">Selecione</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.nome_fantasia}>
                    {cliente.nome_fantasia}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tipo:</label>
              <select
                name="tipo"
                value={filtros.tipo}
                onChange={aoMudarFiltro}
              >
                <option value="">Selecione</option>
                <option value="top 30">TOP 30</option>
                <option value="a">A</option>
                <option value="b">B</option>
                <option value="c">C</option>
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

            <div className="form-group">
              <label>Vendedor:</label>
              <select
                name="vendedor"
                value={filtros.vendedor}
                onChange={aoMudarFiltro}
              >
                <option value="">Selecione</option>
                {Object.values(usuariosMap).map((usuario) => (
                  <option key={usuario.id} value={usuario.nome}>
                    {usuario.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Segmento:</label>
              <select
                name="segmento"
                value={filtros.segmento}
                onChange={aoMudarFiltro}
              >
                <option value="">Selecione</option>
                {Object.values(segmentosMap).map((segmento) => (
                  <option key={segmento.id} value={segmento.nome}>
                    {segmento.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Grupo Econômico:</label>
              <select
                name="grupo_economico"
                value={filtros.grupo_economico}
                onChange={aoMudarFiltro}
              >
                <option value="">Selecione</option>
                {Object.values(gruposEconomicosMap || {}).map((grupo) => (
                  <option key={grupo.id} value={grupo.nome}>
                    {grupo.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Pertence Grupo Econômico:</label>
              <select
                name="pertence_grupo"
                value={filtros.pertence_grupo}
                onChange={aoMudarFiltro}
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="não">Não</option>
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
            <th className="global-titulo-tabela">CPF/CNPJ</th>
            <th className="global-titulo-tabela">Tipo</th>
            <th className="global-titulo-tabela">Status</th>
            <th className="global-titulo-tabela">Vendedor</th>
            <th className="global-titulo-tabela">Segmento</th>
            <th className="global-titulo-tabela">Valor dos Contratos</th>
            <th className="global-titulo-tabela">Pertence Grupo Econômico</th>
            <th className="global-titulo-tabela">Grupo Econômico</th>
          </tr>
        </thead>
        <tbody>
          {dadosExportacao.map((cliente, index) => (
            <tr key={index}>
              <td className="global-conteudo-tabela">
                {cliente["Nome Fantasia"]}
              </td>
              <td className="global-conteudo-tabela">{cliente["CPF/CNPJ"]}</td>
              <td className="global-conteudo-tabela">{cliente["Tipo"]}</td>
              <td className="global-conteudo-tabela">{cliente["Status"]}</td>
              <td className="global-conteudo-tabela">
                {cliente["Usuário Responsável"]}
              </td>
              <td className="global-conteudo-tabela">{cliente["Segmento"]}</td>
              <td className="global-conteudo-tabela">
                {cliente["Valor Total dos Contratos"].toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </td>
              <td className="global-conteudo-tabela">
                {cliente["Pertence Grupo Econômico"]}
              </td>
              <td className="global-conteudo-tabela">{cliente["Grupo Econômico"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
