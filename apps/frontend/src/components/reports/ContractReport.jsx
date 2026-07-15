import { useState, useMemo } from 'react';
import { CSVLink } from 'react-csv';
import { Download, Filter, Search, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

const ContractReport = ({ contracts, clients, products, clientsMap, productsMap, usersMap, groupsMap }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        solucao: '',
        cliente: '',
        status: '',
        tipo_faturamento: '',
        mes_vencimento: '',
        ano_vencimento: '',
        grupo_economico: '',
        pertence_grupo: '',
    });

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
        setFilters({
            solucao: '',
            cliente: '',
            status: '',
            tipo_faturamento: '',
            mes_vencimento: '',
            ano_vencimento: '',
            grupo_economico: '',
            pertence_grupo: '',
        });
        setSearchTerm('');
    };

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

    const dadosProcessados = useMemo(() => {
        return contracts.map((contrato) => {
            const vencimento = calcularProximoVencimento(contrato.data_inicio, contrato.duracao);
            return {
                ...contrato,
                vencimentoCalculado: vencimento,
            };
        });
    }, [contracts]);

    const anosDisponiveis = useMemo(() => {
        const anos = new Set();
        dadosProcessados.forEach((c) => {
            if (c.vencimentoCalculado instanceof Date) {
                anos.add(c.vencimentoCalculado.getFullYear());
            }
        });
        return Array.from(anos).sort((a, b) => a - b);
    }, [dadosProcessados]);

    const filteredContracts = useMemo(() => {
        return dadosProcessados.filter((contrato) => {
            const produto = productsMap[contrato.id_produto];
            const cliente = clientsMap[contrato.id_cliente];
            const vencimento = contrato.vencimentoCalculado;

            if (filtros.mes_vencimento) {
                if (!vencimento || vencimento === "Indeterminado") return false;
                if ((vencimento.getMonth() + 1) !== parseInt(filtros.mes_vencimento)) return false;
            }

            if (filtros.ano_vencimento) {
                if (filtros.ano_vencimento === "Indeterminado") {
                    if (vencimento !== "Indeterminado") return false;
                } else {
                    if (!vencimento || vencimento === "Indeterminado") return false;
                    if (vencimento.getFullYear() !== parseInt(filtros.ano_vencimento)) return false;
                }
            }

            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                (cliente?.nome_fantasia || '').toLowerCase().includes(searchLower) ||
                (produto?.nome || '').toLowerCase().includes(searchLower);

            const matchesSolucao = !filters.solucao || (produto?.nome || '') === filters.solucao;
            const matchesCliente = !filters.cliente || (cliente?.nome_fantasia || '') === filters.cliente;
            const matchesStatus = !filters.status || (contrato.status || '').toLowerCase() === filters.status.toLowerCase();
            const matchesFaturamento = !filters.tipo_faturamento || (contrato.tipo_faturamento || '').toLowerCase() === filters.tipo_faturamento.toLowerCase();
            const matchesGrupo = !filters.grupo_economico || (groupsMap[cliente?.id_grupo_economico]?.nome || '') === filters.grupo_economico;
            const pertenceGrupo = cliente?.id_grupo_economico && groupsMap[cliente?.id_grupo_economico] ? 'sim' : 'não';
            const matchesPertenceGrupo = !filters.pertence_grupo || pertenceGrupo === filters.pertence_grupo;

            return matchesSearch && matchesSolucao && matchesCliente && matchesStatus && matchesFaturamento && matchesGrupo && matchesPertenceGrupo;
        }).sort((a, b) => parseFloat(b.valor_mensal || 0) - parseFloat(a.valor_mensal || 0));
    }, [dadosProcessados, filters, searchTerm, productsMap, clientsMap, groupsMap]);

    const csvData = useMemo(() => {
        return filteredContracts.map((contrato) => {
            const cliente = clientsMap[contrato.id_cliente];
            const produto = productsMap[contrato.id_produto];
            const vencimento = contrato.vencimentoCalculado;

            let vencimentoFormatado = "Indeterminado";
            if (vencimento instanceof Date) {
                vencimentoFormatado = vencimento.toLocaleDateString("pt-BR");
            }

            return {
                "Solução": produto?.nome || "Desconhecido",
                "Cliente": cliente?.nome_fantasia || "Desconhecido",
                "Pertence Grupo Econômico": cliente?.id_grupo_economico && groupsMap[cliente.id_grupo_economico] ? "sim" : "não",
                "Grupo Econômico": groupsMap[cliente?.id_grupo_economico]?.nome || "",
                "Status": contrato.status || "",
                "Reajuste": formatDate(contrato.proximo_reajuste) || "",
                "Data de Vencimento": vencimentoFormatado,
                "Tipo Faturamento": contrato.tipo_faturamento || "",
                "Renovação Automática": contrato.renovacao_automatica ? "Sim" : "Não",
                "Vendedor": usersMap[cliente?.id_usuario]?.nome || "Desconhecido",
                "Moeda": contrato.moeda || "",
                "Índice Reajuste": contrato.nome_indice || "",
                "Valor Base": contrato.valor_mensal || 0
            };
        });
    }, [filteredContracts, clientsMap, productsMap, usersMap, groupsMap]);

    const totalValor = filteredContracts.reduce((acc, curr) => {
        let val = curr.valor_mensal;
        if (typeof val === 'string') val = val.replace(',', '.');
        return acc + parseFloat(val || 0);
    }, 0);

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-lg border border-slate-200 gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar cliente ou solução..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full"
                    />
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Button variant="outline" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
                        Filtros
                    </Button>
                    <CSVLink data={csvData} filename={"relatorio_contratos.csv"} className="btn-export">
                        <Button variant="primary" icon={Download}>Exportar CSV</Button>
                    </CSVLink>
                </div>
            </div>

            {showFilters && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Solução</label>
                        <select name="solucao" value={filters.solucao} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                            <option value="">Todas</option>
                            {products.map(p => (
                                <option key={p.id} value={p.nome}>{p.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Cliente</label>
                        <select name="cliente" value={filters.cliente} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                            <option value="">Todos</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.nome_fantasia}>{c.nome_fantasia}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                            <option value="">Todos</option>
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Tipo Faturamento</label>
                        <select name="tipo_faturamento" value={filters.tipo_faturamento} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                            <option value="">Todos</option>
                            <option value="mensal">Mensal</option>
                            <option value="anual">Anual</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Mês Vencimento</label>
                        <select name="mes_vencimento" value={filters.mes_vencimento} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                            <option value="">Todos</option>
                            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Ano Vencimento</label>
                        <select name="ano_vencimento" value={filters.ano_vencimento} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                            <option value="">Todos</option>
                            {anosDisponiveis.map(a => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                            <option value="Indeterminado">Indeterminado</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Grupo Econômico</label>
                        <select name="grupo_economico" value={filters.grupo_economico} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                            <option value="">Todos</option>
                            {Object.values(groupsMap || {}).map((g) => (
                                <option key={g.id} value={g.nome}>{g.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Pertence a Grupo?</label>
                        <select name="pertence_grupo" value={filters.pertence_grupo} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                            <option value="">Todos</option>
                            <option value="sim">Sim</option>
                            <option value="não">Não</option>
                        </select>
                    </div>
                    <div className="md:col-span-4 flex justify-end">
                        <Button variant="ghost" icon={X} onClick={clearFilters} className="text-slate-500">Limpar Filtros</Button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Solução</th>
                                <th className="px-6 py-3">Grupo Econômico</th>
                                <th className="px-6 py-3">Reajuste</th>
                                <th className="px-6 py-3">Vencimento</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredContracts.map(c => {
                                let vencimentoFormatado = "Indeterminado";
                                if (c.vencimentoCalculado instanceof Date) {
                                    vencimentoFormatado = c.vencimentoCalculado.toLocaleDateString("pt-BR");
                                }

                                return (
                                    <tr key={c.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 font-medium text-slate-900">{clientsMap[c.id_cliente]?.nome_fantasia || '-'}</td>
                                        <td className="px-6 py-3 text-slate-500">{productsMap[c.id_produto]?.nome || '-'}</td>
                                        <td className="px-6 py-3 text-slate-500">{groupsMap[clientsMap[c.id_cliente]?.id_grupo_economico]?.nome || '-'}</td>
                                        <td className="px-6 py-3 text-slate-500">{formatDate(c.proximo_reajuste) || '-'}</td>
                                        <td className="px-6 py-3 text-slate-500">{vencimentoFormatado}</td>
                                        <td className="px-6 py-3">
                                            <Badge variant={(c.status || '').toLowerCase() === 'ativo' ? 'success' : 'secondary'}>{c.status}</Badge>
                                        </td>
                                        <td className="px-6 py-3 text-right font-medium text-slate-700">{formatCurrency(c.valor_mensal)}</td>
                                    </tr>
                                );
                            })}
                            {filteredContracts.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold text-slate-900">
                            <tr>
                                <td colSpan="6" className="px-6 py-3 text-right">Total:</td>
                                <td className="px-6 py-3 text-right">{formatCurrency(totalValor)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500">
                    Mostrando {filteredContracts.length} registro(s)
                </div>
            </div>
        </div>
    );
};

export default ContractReport;
