import { useState, useMemo } from 'react';
import { Download, Search, Filter, X } from 'lucide-react';
import { exportToExcel } from '../../utils/excel';
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
        vendedor: '',
        vp: '',
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
            vendedor: '',
            vp: '',
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

            if (filters.mes_vencimento) {
                if (!vencimento || vencimento === "Indeterminado") return false;
                if ((vencimento.getMonth() + 1) !== parseInt(filters.mes_vencimento)) return false;
            }

            if (filters.ano_vencimento) {
                if (filters.ano_vencimento === "Indeterminado") {
                    if (vencimento !== "Indeterminado") return false;
                } else {
                    if (!vencimento || vencimento === "Indeterminado") return false;
                    if (vencimento.getFullYear() !== parseInt(filters.ano_vencimento)) return false;
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
            const matchesVendedor = !filters.vendedor || (usersMap[cliente?.id_usuario]?.nome || '') === filters.vendedor;
            const matchesVp = !filters.vp || (usersMap[cliente?.vp]?.nome || '') === filters.vp;

            return matchesSearch && matchesSolucao && matchesCliente && matchesStatus && matchesFaturamento && matchesGrupo && matchesPertenceGrupo && matchesVendedor && matchesVp;
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

            let expiracaoFormatada = `${contrato.duracao} MESES`;
            if (parseInt(contrato.duracao) === 12000) {
              expiracaoFormatada = "Indeterminado";
            }

            return {
                "Solução": produto?.nome || "Desconhecido",
                "Cliente": cliente?.nome_fantasia || "Desconhecido",
                "Vendedor": usersMap[cliente?.id_usuario]?.nome || "Desconhecido",
                "VP": usersMap[cliente?.vp]?.nome || "Desconhecido",
                "Pertence Grupo Econômico": cliente?.id_grupo_economico && groupsMap[cliente.id_grupo_economico] ? "sim" : "não",
                "Grupo Econômico": groupsMap[cliente?.id_grupo_economico]?.nome || "",
                "Status": contrato.status || "",
                "Reajuste": formatDate(contrato.proximo_reajuste) || "",
                "Data de Vencimento": vencimentoFormatado,
                "Expiração": expiracaoFormatada,
                "Faturamento": contrato.tipo_faturamento || "",
                "Valor": formatCurrency(contrato.valor_mensal || 0)
            };
        });
    }, [filteredContracts, clientsMap, productsMap, groupsMap]);

    const totalValor = filteredContracts.reduce((acc, curr) => {
        let val = curr.valor_mensal;
        if (typeof val === 'string') val = val.replace(',', '.');
        return acc + parseFloat(val || 0);
    }, 0);

    const handleExport = () => {
        exportToExcel(csvData, "relatorio_contratos");
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar contrato..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full"
                    />
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Button variant="outline" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
                        Filtros
                    </Button>
                    <Button variant="primary" icon={Download} onClick={handleExport}>
                        Exportar Excel
                    </Button>
                </div>
            </div>

            {showFilters && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Solução</label>
                        <select name="solucao" value={filters.solucao} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todas</option>
                            {products.map(p => (
                                <option key={p.id} value={p.nome}>{p.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Cliente</label>
                        <select name="cliente" value={filters.cliente} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todos</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.nome_fantasia}>{c.nome_fantasia}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Vendedor</label>
                        <select name="vendedor" value={filters.vendedor} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todos</option>
                            {Object.values(usersMap || {}).map((u) => (
                                <option key={u.id} value={u.nome}>{u.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">VP</label>
                        <select name="vp" value={filters.vp} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todos</option>
                            {Object.values(usersMap || {}).map((u) => (
                                <option key={u.id} value={u.nome}>{u.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todos</option>
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo Faturamento</label>
                        <select name="tipo_faturamento" value={filters.tipo_faturamento} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todos</option>
                            <option value="mensal">Mensal</option>
                            <option value="anual">Anual</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mês Vencimento</label>
                        <select name="mes_vencimento" value={filters.mes_vencimento} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todos</option>
                            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Ano Vencimento</label>
                        <select name="ano_vencimento" value={filters.ano_vencimento} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todos</option>
                            {anosDisponiveis.map(a => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                            <option value="Indeterminado">Indeterminado</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Grupo Econômico</label>
                        <select name="grupo_economico" value={filters.grupo_economico} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todos</option>
                            {Object.values(groupsMap || {}).map((g) => (
                                <option key={g.id} value={g.nome}>{g.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Pertence a Grupo?</label>
                        <select name="pertence_grupo" value={filters.pertence_grupo} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todos</option>
                            <option value="sim">Sim</option>
                            <option value="não">Não</option>
                        </select>
                    </div>
                    <div className="md:col-span-4 flex justify-end">
                        <Button variant="ghost" icon={X} onClick={clearFilters} className="text-slate-500 dark:text-slate-400">Limpar Filtros</Button>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700 sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Solução</th>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Vendedor</th>
                                <th className="px-6 py-3">VP</th>
                                <th className="px-6 py-3">Pertence Grupo Econômico</th>
                                <th className="px-6 py-3">Grupo Econômico</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Reajuste</th>
                                <th className="px-6 py-3">Data de Vencimento</th>
                                <th className="px-6 py-3">Expiração</th>
                                <th className="px-6 py-3">Faturamento</th>
                                <th className="px-6 py-3 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {csvData.map((c, index) => (
                                <tr key={index} className="hover:bg-slate-50 dark:bg-slate-800/50">
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{c["Solução"]}</td>
                                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100">{c["Cliente"]}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{c["Vendedor"]}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{c["VP"]}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{c["Pertence Grupo Econômico"]}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{c["Grupo Econômico"]}</td>
                                    <td className="px-6 py-3">
                                        <Badge status={c["Status"]} />
                                    </td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{c["Reajuste"]}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{c["Data de Vencimento"]}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{c["Expiração"]}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400 capitalize">{c["Faturamento"]}</td>
                                    <td className="px-6 py-3 text-right font-medium text-slate-700 dark:text-slate-300">{c["Valor"]}</td>
                                </tr>
                            ))}
                            {csvData.length === 0 && (
                                <tr>
                                    <td colSpan="12" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-900 dark:text-slate-100 sticky bottom-0 border-t border-slate-200 dark:border-slate-700">
                            <tr>
                                <td colSpan="11" className="px-6 py-3 text-right">Total:</td>
                                <td className="px-6 py-3 text-right">{formatCurrency(totalValor)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    Mostrando {filteredContracts.length} registro(s)
                </div>
            </div>
        </div>
    );
};

export default ContractReport;
