import { useState, useMemo } from 'react';
import { CSVLink } from 'react-csv';
import { Download, Search, Calendar, Filter, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import Api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const HistoryReport = ({ clients, contracts, products, segmentsMap, groupsMap, clientClassificationsMap, usersMap }) => {
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [loading, setLoading] = useState(false);
    const [historicoClientes, setHistoricoClientes] = useState([]);
    const [historicoContratos, setHistoricoContratos] = useState([]);
    const [abaAtiva, setAbaAtiva] = useState("clientes");
    const [showFilters, setShowFilters] = useState(false);
    
    const [statusCliente, setStatusCliente] = useState("");
    const [statusContrato, setStatusContrato] = useState("");

    const clientesMap = useMemo(() => clients.reduce((map, c) => ((map[c.id] = c), map), {}), [clients]);
    const produtosMap = useMemo(() => products.reduce((map, p) => ((map[p.id] = p), map), {}), [products]);
    const contratosAtuaisMap = useMemo(() => contracts.reduce((map, c) => ((map[c.id] = c), map), {}), [contracts]);

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

    const historicoContratosProcessados = useMemo(() => {
        return historicoContratos.map(c => {
            const contratoAtual = contratosAtuaisMap[c.id_contrato_original];
            const duracao = c.duracao || contratoAtual?.duracao;
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

    const valoresContratosPorClienteEData = useMemo(() => {
        const totais = {};
        historicoContratos.forEach(c => {
            const status = c.status ? c.status.toLowerCase() : "";
            if (status === 'ativo') {
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

    const buscarHistorico = async () => {
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
            setHistoricoClientes(resClientes.historico || []);
            setHistoricoContratos(resContratos.historico || []);
        } catch (error) {
            console.error("Erro ao buscar histórico:", error);
            alert("Erro ao buscar histórico.");
        } finally {
            setLoading(false);
        }
    };

    const csvClientes = useMemo(() => {
        return clientesFiltrados.map((cliente) => {
            const valorTotalContratos = valoresContratosPorClienteEData[`${cliente.id_cliente_original}_${cliente.data_referencia}`] || 0;
            const tipoCliente = clientClassificationsMap[groupsMap[cliente.id_grupo_economico]?.id_classificacao_cliente]?.nome || clientClassificationsMap[cliente.id_classificacao_cliente]?.nome || "Desconhecido";

            return {
                "Data Referência": formatDate(cliente.data_referencia),
                "Nome Fantasia": cliente.nome_fantasia || "",
                "CPF/CNPJ": cliente.cpf_cnpj || "",
                "Grupo Econômico": groupsMap[cliente.id_grupo_economico]?.nome || "",
                "Tipo": tipoCliente,
                "Status": cliente.status,
                "Usuário Responsável": usersMap[cliente.id_usuario]?.nome || "Desconhecido",
                "VP": usersMap[cliente.vp]?.nome || "Desconhecido",
                "Segmento": segmentsMap[cliente.id_segmento]?.nome || "Desconhecido",
                "Valor Total dos Contratos Ativos": valorTotalContratos,
                "Pertence Grupo Econômico": cliente.id_grupo_economico && groupsMap[cliente.id_grupo_economico] ? "sim" : "não"
            };
        });
    }, [clientesFiltrados, valoresContratosPorClienteEData, clientClassificationsMap, groupsMap, usersMap, segmentsMap]);

    const csvContratos = useMemo(() => {
        return contratosFiltrados.map((contrato) => {
            const cliente = clientesMap[contrato.id_cliente];
            const produto = produtosMap[contrato.id_produto];
            let vencimentoFormatado = "Indeterminado";
            if (contrato.vencimentoCalculado instanceof Date) {
                vencimentoFormatado = contrato.vencimentoCalculado.toLocaleDateString("pt-BR");
            }
            return {
                "Data Referência": formatDate(contrato.data_referencia),
                "Solução": produto?.nome || "Desconhecido",
                "Cliente": cliente?.nome_fantasia || "Desconhecido",
                "Pertence Grupo Econômico": cliente?.id_grupo_economico && groupsMap[cliente.id_grupo_economico] ? "sim" : "não",
                "Grupo Econômico": groupsMap[cliente?.id_grupo_economico]?.nome || "",
                "Status": contrato.status,
                "Reajuste": formatDate(contrato.proximo_reajuste_resolvido),
                "Data de Vencimento": vencimentoFormatado,
                "Tipo Faturamento": contrato.tipo_faturamento_resolvido || "Desconhecido",
                "Renovação Automática": contrato.renovacao_automatica ? "Sim" : "Não",
                "Vendedor": usersMap[cliente?.id_usuario]?.nome || "Desconhecido",
                "Moeda": contrato.moeda,
                "Índice Reajuste": contrato.nome_indice || "",
                "Valor Base": contrato.valor_mensal || 0
            };
        });
    }, [contratosFiltrados, clientesMap, produtosMap, groupsMap, usersMap]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-lg border border-slate-200 gap-4">
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <Input 
                            type="date" 
                            value={dataInicio} 
                            onChange={e => setDataInicio(e.target.value)}
                            className="w-full md:w-40 text-sm"
                        />
                        <span className="text-slate-500">até</span>
                        <Input 
                            type="date" 
                            value={dataFim} 
                            onChange={e => setDataFim(e.target.value)}
                            className="w-full md:w-40 text-sm"
                        />
                    </div>
                    <Button variant="primary" onClick={buscarHistorico} disabled={loading} className="w-full md:w-auto">
                        {loading ? "Buscando..." : "Buscar Histórico"}
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Button variant="outline" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
                        Filtros
                    </Button>
                    {abaAtiva === 'clientes' ? (
                        <CSVLink data={csvClientes} filename={"historico_clientes.csv"} className="btn-export">
                            <Button variant="outline" icon={Download}>Exportar Clientes</Button>
                        </CSVLink>
                    ) : (
                        <CSVLink data={csvContratos} filename={"historico_contratos.csv"} className="btn-export">
                            <Button variant="outline" icon={Download}>Exportar Contratos</Button>
                        </CSVLink>
                    )}
                </div>
            </div>

            {showFilters && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                    {abaAtiva === 'clientes' && (
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Status Cliente</label>
                            <select value={statusCliente} onChange={e => setStatusCliente(e.target.value)} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                                <option value="">Todos</option>
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                            </select>
                        </div>
                    )}
                    {abaAtiva === 'contratos' && (
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Status Contrato</label>
                            <select value={statusContrato} onChange={e => setStatusContrato(e.target.value)} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                                <option value="">Todos</option>
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                            </select>
                        </div>
                    )}
                    <div className="flex items-end">
                        <Button variant="ghost" icon={X} onClick={() => { setStatusCliente(''); setStatusContrato(''); }} className="text-slate-500">
                            Limpar Filtros
                        </Button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="flex border-b border-slate-200 bg-slate-50">
                    <button
                        className={`flex-1 py-3 px-6 text-sm font-medium transition-colors ${abaAtiva === "clientes" ? "bg-white text-teal-600 border-b-2 border-teal-600" : "text-slate-600 hover:bg-slate-100"}`}
                        onClick={() => setAbaAtiva("clientes")}
                    >
                        Histórico de Clientes
                    </button>
                    <button
                        className={`flex-1 py-3 px-6 text-sm font-medium transition-colors ${abaAtiva === "contratos" ? "bg-white text-amber-600 border-b-2 border-amber-600" : "text-slate-600 hover:bg-slate-100"}`}
                        onClick={() => setAbaAtiva("contratos")}
                    >
                        Histórico de Contratos
                    </button>
                </div>

                <div className="overflow-x-auto relative min-h-[300px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                        </div>
                    )}

                    {abaAtiva === "clientes" ? (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3">Data Ref.</th>
                                    <th className="px-6 py-3">Razão Social</th>
                                    <th className="px-6 py-3">Nome Fantasia</th>
                                    <th className="px-6 py-3">Segmento</th>
                                    <th className="px-6 py-3">Grupo Econômico</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Valor Contratos (Ativos)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {clientesFiltrados.map((c, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 text-slate-500 whitespace-nowrap">{formatDate(c.data_referencia)}</td>
                                        <td className="px-6 py-3 font-medium text-slate-900">{c.razao_social || '-'}</td>
                                        <td className="px-6 py-3 text-slate-500">{c.nome_fantasia || '-'}</td>
                                        <td className="px-6 py-3 text-slate-500">{segmentsMap[c.id_segmento]?.nome || '-'}</td>
                                        <td className="px-6 py-3 text-slate-500">{groupsMap[c.id_grupo_economico]?.nome || '-'}</td>
                                        <td className="px-6 py-3">
                                            <Badge variant={(c.status || '').toLowerCase() === 'ativo' ? 'success' : 'secondary'}>{c.status}</Badge>
                                        </td>
                                        <td className="px-6 py-3 text-right font-medium text-slate-700">
                                            {formatCurrency(valoresContratosPorClienteEData[`${c.id_cliente_original}_${c.data_referencia}`] || 0)}
                                        </td>
                                    </tr>
                                ))}
                                {!loading && clientesFiltrados.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                                            Selecione as datas e busque para ver o histórico.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3">Data Ref.</th>
                                    <th className="px-6 py-3">Cliente</th>
                                    <th className="px-6 py-3">Solução</th>
                                    <th className="px-6 py-3">Grupo Econômico</th>
                                    <th className="px-6 py-3">Reajuste</th>
                                    <th className="px-6 py-3">Vencimento</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Valor Base</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {contratosFiltrados.map((c, i) => {
                                    let vencimentoFormatado = "Indeterminado";
                                    if (c.vencimentoCalculado instanceof Date) {
                                        vencimentoFormatado = c.vencimentoCalculado.toLocaleDateString("pt-BR");
                                    }
                                    return (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="px-6 py-3 text-slate-500 whitespace-nowrap">{formatDate(c.data_referencia)}</td>
                                            <td className="px-6 py-3 font-medium text-slate-900">{clientesMap[c.id_cliente]?.nome_fantasia || '-'}</td>
                                            <td className="px-6 py-3 text-slate-500">{produtosMap[c.id_produto]?.nome || '-'}</td>
                                            <td className="px-6 py-3 text-slate-500">{groupsMap[clientesMap[c.id_cliente]?.id_grupo_economico]?.nome || '-'}</td>
                                            <td className="px-6 py-3 text-slate-500">{formatDate(c.proximo_reajuste_resolvido) || '-'}</td>
                                            <td className="px-6 py-3 text-slate-500">{vencimentoFormatado}</td>
                                            <td className="px-6 py-3">
                                                <Badge variant={(c.status || '').toLowerCase() === 'ativo' ? 'success' : 'secondary'}>{c.status}</Badge>
                                            </td>
                                            <td className="px-6 py-3 text-right font-medium text-slate-700">{formatCurrency(c.valor_mensal)}</td>
                                        </tr>
                                    );
                                })}
                                {!loading && contratosFiltrados.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                                            Selecione as datas e busque para ver o histórico.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryReport;
