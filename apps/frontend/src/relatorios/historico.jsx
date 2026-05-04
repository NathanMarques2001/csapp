import { useState, useMemo } from "react";
import Api from "../utils/api";
import Carregando from "../componentes/carregando";
import Formatadores from "../utils/formatadores";
import Excel from "../utils/excel";
import Popup from "../componentes/pop-up";

export default function RelatorioHistorico({
    usuariosMap,
    clientes = [],
    contratos = [],
    produtos = [],
    segmentosMap = {},
    gruposEconomicosMap = {},
    classificacoesClientesMap = {}
}) {
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [statusCliente, setStatusCliente] = useState("");
    const [statusContrato, setStatusContrato] = useState("");
    const [loading, setLoading] = useState(false);
    const [historicoClientes, setHistoricoClientes] = useState([]);
    const [historicoContratos, setHistoricoContratos] = useState([]);

    const clientesMap = useMemo(() => clientes.reduce((map, c) => ((map[c.id] = c), map), {}), [clientes]);
    const produtosMap = useMemo(() => produtos.reduce((map, p) => ((map[p.id] = p), map), {}), [produtos]);

    // Mapa de contratos atuais para buscar informações perdidas no histórico (duração, reajuste)
    const contratosAtuaisMap = useMemo(() => contratos.reduce((map, c) => ((map[c.id] = c), map), {}), [contratos]);

    // Função para calcular o próximo vencimento (reutilizada de contratos.jsx)
    const calcularProximoVencimento = (dataInicio, duracao) => {
        if (!dataInicio) return null;
        const duracaoMeses = parseInt(duracao);
        if (!duracaoMeses || duracaoMeses <= 0) return null;
        if (duracaoMeses === 12000) return "Indeterminado";

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        let data = new Date(dataInicio);

        if (typeof dataInicio === 'string') {
            if (dataInicio.includes('T')) {
                data = new Date(dataInicio);
            } else if (dataInicio.includes('-')) {
                const parts = dataInicio.split('-');
                data = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            }
        }

        if (isNaN(data.getTime())) return null;

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

    // Pré-processamento dos dados de contratos para exportação e exibição
    const historicoContratosProcessados = useMemo(() => {
        return historicoContratos.map(c => {
            // Tenta buscar dados do contrato atual se faltar no histórico
            const contratoAtual = contratosAtuaisMap[c.id_contrato_original];

            const duracao = c.duracao || contratoAtual?.duracao;
            // Se id_faturado for 1, assumimos mensal, se 2 anual, etc. ou usamos do contrato atual
            // Mas o front usa strings 'mensal', 'anual'. O histórico salvou ID.
            // Vamos tentar pegar do contrato atual primeiro.
            const tipo_faturamento = contratoAtual?.tipo_faturamento || (c.id_faturado === 1 ? "mensal" : c.id_faturado === 2 ? "anual" : "Desconhecido");
            const proximo_reajuste = c.proximo_reajuste || contratoAtual?.proximo_reajuste;

            const vencimento = calcularProximoVencimento(c.data_inicio, duracao);

            return {
                ...c,
                duracao_resolvida: duracao,
                tipo_faturamento_resolvido: tipo_faturamento,
                proximo_reajuste_resolvido: proximo_reajuste,
                vencimentoCalculado: vencimento
            };
        });
    }, [historicoContratos, contratosAtuaisMap]);

    // Calcular valor total dos contratos para cada cliente no histórico
    const valoresContratosPorClienteEData = useMemo(() => {
        const totais = {}; // chave: id_cliente + '_' + data_referencia

        historicoContratos.forEach(c => {
            // Verifique se o status existe e trate
            const status = c.status ? c.status.toLowerCase() : "";

            if (status === 'ativo') {
                // No histórico de contratos, o campo é id_cliente (verificado no service)
                const key = `${c.id_cliente}_${c.data_referencia}`;
                const valor = parseFloat(c.valor_mensal || 0);

                totais[key] = (totais[key] || 0) + valor;
            }
        });
        return totais;
    }, [historicoContratos]);


    const clientesFiltrados = useMemo(() => {
        return historicoClientes.filter(c =>
            !statusCliente || (c.status && c.status.toLowerCase() === statusCliente.toLowerCase())
        ).sort((a, b) => {
            const valA = valoresContratosPorClienteEData[`${a.id_cliente_original}_${a.data_referencia}`] || 0;
            const valB = valoresContratosPorClienteEData[`${b.id_cliente_original}_${b.data_referencia}`] || 0;
            return valB - valA;
        });
    }, [historicoClientes, statusCliente, valoresContratosPorClienteEData]);

    const contratosFiltrados = useMemo(() => {
        return historicoContratosProcessados.filter(c =>
            !statusContrato || (c.status && c.status.toLowerCase() === statusContrato.toLowerCase())
        ).sort((a, b) => {
            const valA = parseFloat(a.valor_mensal || 0);
            const valB = parseFloat(b.valor_mensal || 0);
            return valB - valA;
        });
    }, [historicoContratosProcessados, statusContrato]);

    const [abaAtiva, setAbaAtiva] = useState("clientes");
    const [abrirPopup, setAbrirPopup] = useState(false);
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    const excelClientes = new Excel("Histórico Clientes");
    const excelContratos = new Excel("Histórico Contratos");

    async function buscarHistorico() {
        if (!dataInicio || !dataFim) {
            alert("Por favor, selecione as datas de início e fim.");
            return;
        }

        setLoading(true);
        try {
            const api = new Api();

            const [resClientes, resContratos] = await Promise.all([
                api.get(`/historico/clientes?dataInicio=${dataInicio}&dataFim=${dataFim}`),
                api.get(`/historico/contratos?dataInicio=${dataInicio}&dataFim=${dataFim}`)
            ]);

            setHistoricoClientes(resClientes || []);
            setHistoricoContratos(resContratos || []);

        } catch (error) {
            console.error("Erro ao buscar histórico:", error);
            alert("Erro ao buscar dados históricos.");
        } finally {
            setLoading(false);
        }
    }

    function formatarData(data) {
        if (!data) return "-";
        // Tenta tratar como data somente se vier como string ISO
        const d = new Date(data);
        // Ajuste simples para exibir fuso local caso venha UTC (como é dateonly, vem string YYYY-MM-DD)
        // Se for string YYYY-MM-DD, split é mais seguro para evitar timezone shifts
        if (typeof data === 'string' && data.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [ano, mes, dia] = data.split('-');
            return `${dia}/${mes}/${ano}`;
        }
        return d.toLocaleDateString('pt-BR');
    }

    function confirmExportarExcel() {
        setAbrirPopup(true);
    }

    function exportarExcel() {
        if (abaAtiva === "clientes") {
            const dadosExportacao = clientesFiltrados.map((c) => {
                // Tenta pegar o nome do grupo e a classificação correta
                // Nota: c.id_grupo_economico e c.id_classificacao_cliente vêm do histórico.
                // Precisamos ver se esses IDs ainda existem nos mapas atuais.
                // Se o histórico salva IDs antigos que foram deletados, map falhará.

                const grupoNome = gruposEconomicosMap[c.id_grupo_economico]?.nome || "";
                const classificacaoNome = classificacoesClientesMap[gruposEconomicosMap[c.id_grupo_economico]?.id_classificacao_cliente]?.nome ||
                    classificacoesClientesMap[c.id_classificacao_cliente]?.nome || "Desconhecido";

                // No histórico de clientes, o campo é id_cliente_original (verificado no log)
                const keyValor = `${c.id_cliente_original}_${c.data_referencia}`;
                const valorTotal = valoresContratosPorClienteEData[keyValor] || 0;

                const usuarioNome = usuariosMap[c.id_usuario]?.nome || "Desconhecido";
                const segmentoNome = segmentosMap[c.id_segmento]?.nome || "Desconhecido";

                return {
                    ...c,
                    // Override raw date fields
                    data_referencia: formatarData(c.data_referencia),

                    "Data Referência": formatarData(c.data_referencia),
                    "Nome Fantasia": c.nome_fantasia,
                    "CPF/CNPJ": c.cpf_cnpj,
                    "Grupo Econômico": grupoNome,
                    "Tipo": classificacaoNome,
                    "Status": c.status,
                    "Usuário Responsável": usuarioNome,
                    "Segmento": segmentoNome,
                    "Valor Total dos Contratos": valorTotal,

                    // Campos calculados extras para garantir que tudo vá para o excel
                    valorTotalCalculado: valorTotal,
                    nomeGrupo: grupoNome,
                    nomeClassificacao: classificacaoNome,
                    nomeUsuario: usuarioNome,
                    nomeSegmento: segmentoNome
                };
            });
            excelClientes.exportToExcel(dadosExportacao);
        } else {
            const dadosExportacao = contratosFiltrados.map((c) => {
                // Resolvendo nomes usando IDs originais armazenados no histórico
                // No histórico de contratos: id_produto e id_cliente (não originais no nome, mas são os FKs)
                const produtoNome = produtosMap[c.id_produto]?.nome || "Desconhecido";
                const clienteNome = clientesMap[c.id_cliente]?.nome_fantasia || "Desconhecido";

                let vencimentoFormatado = "Indeterminado";
                if (c.vencimentoCalculado instanceof Date) {
                    vencimentoFormatado = c.vencimentoCalculado.toLocaleDateString("pt-BR");
                }

                let expiracaoFormatada = `${c.duracao_resolvida} MESES`;
                if (parseInt(c.duracao_resolvida) === 12000) {
                    expiracaoFormatada = "Indeterminado";
                }

                return {
                    ...c,
                    // Sobrescreve campos de data originais com formatação
                    data_referencia: formatarData(c.data_referencia),
                    data_inicio: formatarData(c.data_inicio),
                    proximo_reajuste_resolvido: formatarData(c.proximo_reajuste_resolvido),
                    data_vencimento_calculada: vencimentoFormatado,

                    // Campos Human Readable
                    "Data Referência": formatarData(c.data_referencia),
                    "Data Início": formatarData(c.data_inicio),
                    "Solução": produtoNome,
                    "Cliente": clienteNome,
                    "Status": c.status,
                    "Reajuste": formatarData(c.proximo_reajuste_resolvido),
                    "Data de Vencimento": vencimentoFormatado,
                    "Expiração": expiracaoFormatada,
                    "Faturamento": c.tipo_faturamento_resolvido,
                    "Valor": c.valor_mensal ? parseFloat(c.valor_mensal) : 0,

                    // Campos extras solicitados explicitamente
                    nomeProduto: produtoNome,
                    nomeCliente: clienteNome,
                    vencimentoFormatado: vencimentoFormatado,
                    expiracaoFormatada: expiracaoFormatada
                };
            });
            excelContratos.exportToExcel(dadosExportacao);
        }
        setAbrirPopup(false);
    }

    return (
        <>
            {loading && <Carregando />}

            {abrirPopup && (
                <Popup
                    title={`Exportar Histórico - ${abaAtiva === "clientes" ? "Clientes" : "Contratos"}`}
                    message={`Deseja exportar o histórico de ${abaAtiva === "clientes" ? "clientes" : "contratos"}?`}
                    onConfirm={exportarExcel}
                    onCancel={() => setAbrirPopup(false)}
                />
            )}

            {mostrarFiltros && (
                <div id="filter-container">
                    <form onSubmit={(e) => { e.preventDefault(); buscarHistorico(); setMostrarFiltros(false); }} className="filter-form">
                        <div className="form-group">
                            <label>Data Início:</label>
                            <input
                                type="date"
                                className="global-input"
                                style={{ width: "90%" }}
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Data Fim:</label>
                            <input
                                type="date"
                                className="global-input"
                                style={{ width: "90%" }}
                                value={dataFim}
                                onChange={(e) => setDataFim(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Status Cliente:</label>
                            <select
                                className="global-input"
                                style={{ width: "90%" }}
                                value={statusCliente}
                                onChange={(e) => setStatusCliente(e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Status Contrato:</label>
                            <select
                                className="global-input"
                                style={{ width: "90%" }}
                                value={statusContrato}
                                onChange={(e) => setStatusContrato(e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="filter-button"
                            style={{ marginTop: "10px", width: "100%", backgroundColor: "#97c93d", color: "white", border: "none", padding: "10px" }}
                        >
                            Buscar
                        </button>
                        <button
                            type="button"
                            onClick={() => setMostrarFiltros(false)}
                            id="filter-close-button"
                            className="filter-button"
                            style={{ marginTop: "10px" }}
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

            <div className="abas-historico" style={{ marginBottom: "20px", borderBottom: "2px solid #e9ecef", display: "flex", gap: "20px", marginTop: "2%" }}>
                <button
                    onClick={() => setAbaAtiva("clientes")}
                    style={{
                        background: "none",
                        border: "none",
                        borderBottom: abaAtiva === "clientes" ? "3px solid #0056b3" : "3px solid transparent",
                        padding: "10px 5px",
                        fontSize: "16px",
                        fontWeight: abaAtiva === "clientes" ? "700" : "500",
                        color: abaAtiva === "clientes" ? "#0056b3" : "#6c757d",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                    }}
                >
                    Histórico de Clientes <span style={{ fontSize: "12px", background: "#e9ecef", padding: "2px 8px", borderRadius: "10px", marginLeft: "8px", verticalAlign: "middle" }}>{clientesFiltrados.length}</span>
                </button>
                <button
                    onClick={() => setAbaAtiva("contratos")}
                    style={{
                        background: "none",
                        border: "none",
                        borderBottom: abaAtiva === "contratos" ? "3px solid #0056b3" : "3px solid transparent",
                        padding: "10px 5px",
                        fontSize: "16px",
                        fontWeight: abaAtiva === "contratos" ? "700" : "500",
                        color: abaAtiva === "contratos" ? "#0056b3" : "#6c757d",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                    }}
                >
                    Histórico de Contratos <span style={{ fontSize: "12px", background: "#e9ecef", padding: "2px 8px", borderRadius: "10px", marginLeft: "8px", verticalAlign: "middle" }}>{contratosFiltrados.length}</span>
                </button>
            </div>

            {abaAtiva === "clientes" && (
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
                        </tr>
                    </thead>
                    <tbody>
                        {clientesFiltrados.map((c) => (
                            <tr key={c.id}>
                                <td className="global-conteudo-tabela">{c.nome_fantasia}</td>
                                <td className="global-conteudo-tabela">{c.cpf_cnpj}</td>
                                <td className="global-conteudo-tabela">
                                    {classificacoesClientesMap[gruposEconomicosMap[c.id_grupo_economico]?.id_classificacao_cliente]?.nome ||
                                        classificacoesClientesMap[c.id_classificacao_cliente]?.nome || "Desconhecido"}
                                </td>
                                <td className="global-conteudo-tabela">{c.status}</td>
                                <td className="global-conteudo-tabela">{usuariosMap[c.id_usuario]?.nome || "Desconhecido"}</td>
                                <td className="global-conteudo-tabela">{segmentosMap[c.id_segmento]?.nome || "Desconhecido"}</td>
                                <td className="global-conteudo-tabela">
                                    {(valoresContratosPorClienteEData[`${c.id_cliente_original}_${c.data_referencia}`] || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                            </tr>
                        ))}
                        {clientesFiltrados.length === 0 && (
                            <tr><td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#6c757d" }}>Nenhum registro encontrado para o período selecionado.</td></tr>
                        )}
                    </tbody>
                </table>
            )}

            {abaAtiva === "contratos" && (
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
                        {contratosFiltrados.map((c) => (
                            <tr key={c.id}>
                                <td className="global-conteudo-tabela">{produtosMap[c.id_produto]?.nome || "Desconhecido"}</td>
                                <td className="global-conteudo-tabela">{clientesMap[c.id_cliente]?.nome_fantasia || "Desconhecido"}</td>
                                <td className="global-conteudo-tabela">{c.status}</td>
                                <td className="global-conteudo-tabela">{c.proximo_reajuste_resolvido ? new Date(c.proximo_reajuste_resolvido).toLocaleDateString('pt-BR') : '-'}</td>
                                <td className="global-conteudo-tabela">
                                    {c.vencimentoCalculado instanceof Date ? c.vencimentoCalculado.toLocaleDateString("pt-BR") : "Indeterminado"}
                                </td>
                                <td className="global-conteudo-tabela">
                                    {parseInt(c.duracao_resolvida) === 12000 ? "Indeterminado" : `${c.duracao_resolvida} MESES`}
                                </td>
                                <td className="global-conteudo-tabela global-conteudo-captalize">{c.tipo_faturamento_resolvido}</td>
                                <td className="global-conteudo-tabela">
                                    {c.valor_mensal ? parseFloat(c.valor_mensal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                                </td>
                            </tr>
                        ))}
                        {historicoContratos.length === 0 && (
                            <tr><td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#6c757d" }}>Nenhum registro encontrado para o período selecionado.</td></tr>
                        )}
                    </tbody>
                </table>
            )}
        </>
    );
}
