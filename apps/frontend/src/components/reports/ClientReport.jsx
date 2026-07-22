import { useState, useMemo } from 'react';
import { Download, Filter, Search, X } from 'lucide-react';
import { exportToExcel } from '../../utils/excel';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';

const ClientReport = ({
    clients,
    contracts,
    usersMap,
    segmentsMap,
    groupsMap,
    clientClassificationsMap
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        tipo: '',
        status: '',
        vendedor: '',
        segmento: '',
        grupo_economico: '',
        pertence_grupo: '',
        vp: '',
        tipo_faturamento: '',
    });

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
        setFilters({
            tipo: '',
            status: '',
            vendedor: '',
            segmento: '',
            grupo_economico: '',
            pertence_grupo: '',
            vp: '',
            tipo_faturamento: '',
        });
        setSearchTerm('');
    };

    const filteredClients = useMemo(() => {
        return clients.filter((cliente) => {
            const contratosCliente = contracts.filter(
                (c) => c.id_cliente === cliente.id && (c.status === "ativo" || c.status === "Ativo")
            );

            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                (cliente.nome_fantasia || '').toLowerCase().includes(searchLower) ||
                (cliente.razao_social || '').toLowerCase().includes(searchLower) ||
                (cliente.cpf_cnpj || '').includes(searchLower);

            const tipoCliente = (clientClassificationsMap && groupsMap && cliente) ? 
                (clientClassificationsMap[groupsMap[cliente.id_grupo_economico]?.id_classificacao_cliente]?.nome || 
                clientClassificationsMap[cliente.id_classificacao_cliente]?.nome || "Desconhecido") : "Desconhecido";

            const matchesTipo = !filters.tipo || tipoCliente.toLowerCase() === filters.tipo.toLowerCase();
            const matchesStatus = !filters.status || (cliente.status || '').toLowerCase() === filters.status.toLowerCase();
            const matchesVendedor = !filters.vendedor || (usersMap[cliente.id_usuario]?.nome || '') === filters.vendedor;
            const matchesSegmento = !filters.segmento || (segmentsMap[cliente.id_segmento]?.nome || '') === filters.segmento;
            const matchesGrupo = !filters.grupo_economico || (groupsMap[cliente.id_grupo_economico]?.nome || '') === filters.grupo_economico;
            const belongsToGroup = cliente.id_grupo_economico && groupsMap[cliente.id_grupo_economico] ? 'sim' : 'não';
            const matchesPertenceGrupo = !filters.pertence_grupo || belongsToGroup === filters.pertence_grupo;
            const matchesVp = !filters.vp || (usersMap[cliente.vp]?.nome || '') === filters.vp;
            const matchesFaturamento = !filters.tipo_faturamento || contratosCliente.some(c => (c.tipo_faturamento || '').toLowerCase() === filters.tipo_faturamento.toLowerCase());

            return matchesSearch && matchesTipo && matchesStatus && matchesVendedor && matchesSegmento && matchesGrupo && matchesPertenceGrupo && matchesVp && matchesFaturamento;
        });
    }, [clients, contracts, filters, searchTerm, usersMap, segmentsMap, groupsMap, clientClassificationsMap]);

    const csvData = useMemo(() => {
        return filteredClients.map((cliente) => {
            const contratosCliente = contracts.filter(
                (c) => c.id_cliente === cliente.id && (c.status === "ativo" || c.status === "Ativo")
            );

            const valorTotalContratos = contratosCliente.reduce((soma, contrato) => {
                let valor = contrato.valor_mensal;
                if (typeof valor === 'string') valor = valor.replace(',', '.');
                return soma + parseFloat(valor || 0);
            }, 0);

            const tipoCliente = (clientClassificationsMap && groupsMap && cliente) ? 
                (clientClassificationsMap[groupsMap[cliente.id_grupo_economico]?.id_classificacao_cliente]?.nome || 
                clientClassificationsMap[cliente.id_classificacao_cliente]?.nome || "Desconhecido") : "Desconhecido";

            const faturamentos = Array.from(new Set(contratosCliente.map(c => c.tipo_faturamento).filter(Boolean))).join(", ");

            return {
                "Nome Fantasia": cliente.nome_fantasia || "",
                "CPF/CNPJ": cliente.cpf_cnpj || "",
                "Grupo Econômico": groupsMap && cliente.id_grupo_economico ? groupsMap[cliente.id_grupo_economico]?.nome || "" : "",
                "Tipo": tipoCliente,
                "Status": cliente.status || "",
                "Usuário Responsável": usersMap && cliente.id_usuario ? usersMap[cliente.id_usuario]?.nome || "Desconhecido" : "Desconhecido",
                "VP": usersMap && cliente.vp ? usersMap[cliente.vp]?.nome || "Desconhecido" : "Desconhecido",
                "Segmento": segmentsMap && cliente.id_segmento ? segmentsMap[cliente.id_segmento]?.nome || "Desconhecido" : "Desconhecido",
                "Valor Total dos Contratos": valorTotalContratos,
                "Faturamento": faturamentos || "-",
                "Pertence Grupo Econômico": cliente.id_grupo_economico && groupsMap && groupsMap[cliente.id_grupo_economico] ? "sim" : "não"
            };
        }).sort((a, b) => b["Valor Total dos Contratos"] - a["Valor Total dos Contratos"]);
    }, [filteredClients, contracts, usersMap, segmentsMap, groupsMap, clientClassificationsMap]);

    const handleExport = () => {
        exportToExcel(csvData, "relatorio_clientes");
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar cliente, razão social ou documento..."
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
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
                        <select name="tipo" value={filters.tipo} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white dark:bg-slate-900 py-2 px-3">
                            <option value="">Todos</option>
                            <option value="top 30">TOP 30</option>
                            <option value="a">A</option>
                            <option value="b">B</option>
                            <option value="c">C</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white dark:bg-slate-900 py-2 px-3">
                            <option value="">Todos</option>
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Vendedor</label>
                        <select name="vendedor" value={filters.vendedor} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white dark:bg-slate-900 py-2 px-3">
                            <option value="">Todos</option>
                            {Object.values(usersMap || {}).map((u) => (
                                <option key={u.id} value={u.nome}>{u.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">VP</label>
                        <select name="vp" value={filters.vp} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white dark:bg-slate-900 py-2 px-3">
                            <option value="">Todos</option>
                            {Object.values(usersMap || {}).map((u) => (
                                <option key={u.id} value={u.nome}>{u.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Segmento</label>
                        <select name="segmento" value={filters.segmento} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white dark:bg-slate-900 py-2 px-3">
                            <option value="">Todos</option>
                            {Object.values(segmentsMap || {}).map((s) => (
                                <option key={s.id} value={s.nome}>{s.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Grupo Econômico</label>
                        <select name="grupo_economico" value={filters.grupo_economico} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white dark:bg-slate-900 py-2 px-3">
                            <option value="">Todos</option>
                            {Object.values(groupsMap || {}).map((g) => (
                                <option key={g.id} value={g.nome}>{g.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Pertence a Grupo?</label>
                        <select name="pertence_grupo" value={filters.pertence_grupo} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white dark:bg-slate-900 py-2 px-3">
                            <option value="">Todos</option>
                            <option value="sim">Sim</option>
                            <option value="não">Não</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo Faturamento</label>
                        <select name="tipo_faturamento" value={filters.tipo_faturamento} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white dark:bg-slate-900 py-2 px-3">
                            <option value="">Todos</option>
                            <option value="mensal">Mensal</option>
                            <option value="anual">Anual</option>
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
                                <th className="px-6 py-3">Nome Fantasia</th>
                                <th className="px-6 py-3">CNPJ</th>
                                <th className="px-6 py-3">Grupo Econômico</th>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Vendedor</th>
                                <th className="px-6 py-3">VP</th>
                                <th className="px-6 py-3">Segmento</th>
                                <th className="px-6 py-3">Valor dos Contratos</th>
                                <th className="px-6 py-3">Faturamento</th>
                                <th className="px-6 py-3">Pertence Grupo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {csvData.map((cliente, index) => (
                                <tr key={index} className="hover:bg-slate-50 dark:bg-slate-800/50">
                                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100">{cliente["Nome Fantasia"] || '-'}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{cliente["CPF/CNPJ"] || '-'}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{cliente["Grupo Econômico"] || '-'}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{cliente["Tipo"] || '-'}</td>
                                    <td className="px-6 py-3">
                                        <Badge status={cliente["Status"]} />
                                    </td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{cliente["Usuário Responsável"] || '-'}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{cliente["VP"] || '-'}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{cliente["Segmento"] || '-'}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{formatCurrency(cliente["Valor Total dos Contratos"])}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400 capitalize">{cliente["Faturamento"] || '-'}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{cliente["Pertence Grupo Econômico"]}</td>
                                </tr>
                            ))}
                            {csvData.length === 0 && (
                                <tr>
                                    <td colSpan="11" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    Mostrando {filteredClients.length} registro(s)
                </div>
            </div>
        </div>
    );
};

export default ClientReport;
