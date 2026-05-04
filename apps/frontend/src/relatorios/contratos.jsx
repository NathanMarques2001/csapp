import { useState, useMemo } from "react";
import Popup from "../componentes/pop-up";
import Formatadores from "../utils/formatadores";
import Excel from "../utils/excel";

export default function RelatorioContratos({
  contratos,
  produtos,
  clientes,
}) {

  const excel = new Excel("Relatório de Contratos");
  const [abrirPopup, setAbrirPopup] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    solucao: "",
    cliente: "",
    status: "",
    tipo_faturamento: "",
    mes_vencimento: "",
    ano_vencimento: "",
  });

  const produtosMap = useMemo(() => produtos.reduce((map, p) => ((map[p.id] = p), map), {}), [produtos]);
  const clientesMap = useMemo(() => clientes.reduce((map, c) => ((map[c.id] = c), map), {}), [clientes]);

  // Função para calcular o próximo vencimento
  const calcularProximoVencimento = (dataInicio, duracao) => {
    if (!dataInicio) return null;
    const duracaoMeses = parseInt(duracao);
    if (!duracaoMeses || duracaoMeses <= 0) return null; // Previne loop infinito
    if (duracaoMeses === 12000) return "Indeterminado";

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let data = new Date(dataInicio);

    // Tratamento para dd-mm-yyyy ou ISO
    if (typeof dataInicio === 'string') {
      if (dataInicio.includes('T')) {
        data = new Date(dataInicio);
      } else if (dataInicio.includes('-')) {
        const parts = dataInicio.split('-');
        // Verifica formato (ano-mes-dia ou dia-mes-ano?)
        // Assumindo YYYY-MM-DD padrão ISO do banco
        data = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    }

    // Se data inválida
    if (isNaN(data.getTime())) return null;

    // Se já vence depois de hoje, é a própria data + 0 ciclos
    // Mas a lógica do usuário diz: inicio 2021 + 24 meses -> 2023. Se hoje é 2026, continua somando.
    // Primeiro vencimento teórico:
    data.setMonth(data.getMonth() + duracaoMeses);

    if (data < hoje) {
      let safeCounter = 0;
      while (data < hoje && safeCounter < 1000) {
        data.setMonth(data.getMonth() + duracaoMeses);
        safeCounter++;
      }
    }

    return data;
  };

  // Pré-processamento dos dados para calcular campos e extrair anos disponíveis
  const dadosProcessados = useMemo(() => {
    return contratos.map((contrato) => {
      const vencimento = calcularProximoVencimento(contrato.data_inicio, contrato.duracao);
      return {
        ...contrato,
        vencimentoCalculado: vencimento, // Date object or "Indeterminado"
      };
    });
  }, [contratos]);

  // Extrair anos únicos para o filtro
  const anosDisponiveis = useMemo(() => {
    const anos = new Set();
    dadosProcessados.forEach((c) => {
      if (c.vencimentoCalculado instanceof Date) {
        anos.add(c.vencimentoCalculado.getFullYear());
      }
    });
    return Array.from(anos).sort((a, b) => a - b);
  }, [dadosProcessados]);

  const contratosFiltrados = dadosProcessados.filter((contrato) => {
    const produto = produtosMap[contrato.id_produto];
    const cliente = clientesMap[contrato.id_cliente];
    const vencimento = contrato.vencimentoCalculado;

    // Filtro Mês
    if (filtros.mes_vencimento) {
      if (!vencimento || vencimento === "Indeterminado") return false;
      // getMonth() retorna 0-11, filtro é 1-12
      if ((vencimento.getMonth() + 1) !== parseInt(filtros.mes_vencimento)) return false;
    }

    // Filtro Ano
    if (filtros.ano_vencimento) {
      if (filtros.ano_vencimento === "Indeterminado") {
        if (vencimento !== "Indeterminado") return false;
      } else {
        if (!vencimento || vencimento === "Indeterminado") return false;
        if (vencimento.getFullYear() !== parseInt(filtros.ano_vencimento)) return false;
      }
    }

    return (
      (!filtros.solucao || produto?.nome === filtros.solucao) &&
      (!filtros.cliente || cliente?.nome_fantasia === filtros.cliente) &&
      (!filtros.status || contrato.status === filtros.status) &&
      (!filtros.tipo_faturamento || contrato.tipo_faturamento === filtros.tipo_faturamento)
    );
  }).sort((a, b) => parseFloat(b.valor_mensal) - parseFloat(a.valor_mensal));

  const dadosExportacao = contratosFiltrados.map((contrato) => {
    const cliente = clientesMap[contrato.id_cliente];
    const produto = produtosMap[contrato.id_produto];
    const valor = parseFloat(contrato.valor_mensal);
    const vencimento = contrato.vencimentoCalculado;

    let vencimentoFormatado = "Indeterminado";
    if (vencimento instanceof Date) {
      vencimentoFormatado = vencimento.toLocaleDateString("pt-BR");
    }

    let expiracaoFormatada = `${contrato.duracao} MESES`;
    if (parseInt(contrato.duracao) === 12000) {
      expiracaoFormatada = "Indeterminado";
    }

    return {
      Solução: produto?.nome || "Desconhecido",
      Cliente: cliente?.nome_fantasia || "Desconhecido",
      Status: contrato.status,
      Reajuste: Formatadores.formatarData(contrato.proximo_reajuste),
      "Data de Vencimento": vencimentoFormatado,
      Expiração: expiracaoFormatada,
      Valor: Formatadores.formatarMoeda(valor),
      Faturamento: contrato.tipo_faturamento,
    };
  });

  const baixarRelatorio = (e) => {
    e.preventDefault();
    excel.exportToExcel(dadosExportacao);
    setAbrirPopup(false);
  };

  const aoMudarFiltro = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const meses = [
    { valor: 1, nome: "Janeiro" },
    { valor: 2, nome: "Fevereiro" },
    { valor: 3, nome: "Março" },
    { valor: 4, nome: "Abril" },
    { valor: 5, nome: "Maio" },
    { valor: 6, nome: "Junho" },
    { valor: 7, nome: "Julho" },
    { valor: 8, nome: "Agosto" },
    { valor: 9, nome: "Setembro" },
    { valor: 10, nome: "Outubro" },
    { valor: 11, nome: "Novembro" },
    { valor: 12, nome: "Dezembro" },
  ];

  return (
    <>
      {abrirPopup && (
        <Popup
          title="Exportar Contratos"
          message="Tem certeza que deseja exportar o relatório de contratos?"
          onConfirm={baixarRelatorio}
          onCancel={() => setAbrirPopup(false)}
        />
      )}

      {mostrarFiltros && (
        <div id="filter-container" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
          <form onSubmit={(e) => e.preventDefault()} className="filter-form">
            <div className="form-group">
              <label>Solução:</label>
              <select
                name="solucao"
                value={filtros.solucao}
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
              <label>Cliente:</label>
              <select
                name="cliente"
                value={filtros.cliente}
                onChange={aoMudarFiltro}
              >
                <option value="">Selecione</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.nome_fantasia}>
                    {c.nome_fantasia}
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

            <div className="form-group">
              <label>Tipo Faturamento:</label>
              <select
                name="tipo_faturamento"
                value={filtros.tipo_faturamento}
                onChange={aoMudarFiltro}
              >
                <option value="">Selecione</option>
                <option value="mensal">Mensal</option>
                <option value="anual">Anual</option>
              </select>
            </div>

            <div className="form-group">
              <label>Mês Vencimento:</label>
              <select
                name="mes_vencimento"
                value={filtros.mes_vencimento}
                onChange={aoMudarFiltro}
              >
                <option value="">Todos</option>
                {meses.map((m) => (
                  <option key={m.valor} value={m.valor}>{m.nome}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ano Vencimento:</label>
              <select
                name="ano_vencimento"
                value={filtros.ano_vencimento}
                onChange={aoMudarFiltro}
              >
                <option value="">Todos</option>
                {anosDisponiveis.map((ano) => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
                <option value="Indeterminado">Indeterminado</option>
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
            <th className="global-titulo-tabela">Solução</th>
            <th className="global-titulo-tabela">Cliente</th>
            <th className="global-titulo-tabela">Status</th>
            <th className="global-titulo-tabela">Reajuste</th>
            <th className="global-titulo-tabela">Data de Vencimento</th>
            <th className="global-titulo-tabela">Expiração</th>
            <th className="global-titulo-tabela">Faturamento</th>
            <th className="global-titulo-tabela">Valor</th>
          </tr>
        </thead>
        <tbody>
          {dadosExportacao.map((c, i) => (
            <tr key={i}>
              <td className="global-conteudo-tabela">{c["Solução"]}</td>
              <td className="global-conteudo-tabela">{c["Cliente"]}</td>
              <td className="global-conteudo-tabela">{c["Status"]}</td>
              <td className="global-conteudo-tabela">{c["Reajuste"]}</td>
              <td className="global-conteudo-tabela">{c["Data de Vencimento"]}</td>
              <td className="global-conteudo-tabela">{c["Expiração"]}</td>
              <td className="global-conteudo-tabela global-conteudo-captalize">
                {c["Faturamento"]}
              </td>
              <td className="global-conteudo-tabela">
                {c["Valor"]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
