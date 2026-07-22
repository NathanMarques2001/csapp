import { useState, useEffect, useMemo } from 'react';
import { Download, Search, Filter, X } from 'lucide-react';
import { exportToExcel } from '../../utils/excel';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Api from '../../utils/api';
import Badge from '../ui/Badge';

const LogsReport = ({ contracts, clients, products }) => {
    const api = new Api();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        usuario: '',
        cliente: '',
        statusCliente: '',
        solucao: ''
    });

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const res = await api.get("/logs");
                setLogs(res.logs || res || []);
            } catch (error) {
                console.error("Erro ao buscar logs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const contratosMap = useMemo(() => contracts.reduce((map, c) => ((map[c.id] = c), map), {}), [contracts]);
    const clientesMap = useMemo(() => clients.reduce((map, c) => ((map[c.id] = c), map), {}), [clients]);
    const produtosMap = useMemo(() => products.reduce((map, p) => ((map[p.id] = p), map), {}), [products]);

    const clientesNomes = useMemo(() => {
        const s = new Set();
        logs.forEach((l) => {
            const contrato = contratosMap[l.id_contrato];
            const cliente = contrato ? clientesMap[contrato.id_cliente] : null;
            if (cliente && cliente.nome_fantasia) s.add(cliente.nome_fantasia);
        });
        return Array.from(s).sort();
    }, [logs, contratosMap, clientesMap]);

    const listaProdutos = useMemo(() => {
        const s = new Set();
        logs.forEach((l) => {
            const contrato = contratosMap[l.id_contrato];
            const produto = contrato ? produtosMap[contrato.id_produto] : null;
            if (produto && produto.nome) s.add(produto.nome);
        });
        Object.values(produtosMap).forEach((p) => p && p.nome && s.add(p.nome));
        return Array.from(s).sort();
    }, [logs, contratosMap, produtosMap]);

    const listaStatus = useMemo(() => {
        const s = new Set();
        Object.values(clientesMap).forEach((c) => { if (c && c.status) s.add(c.status); });
        return Array.from(s).sort();
    }, [clientesMap]);

    const usuarios = useMemo(() => {
        const s = new Set();
        logs.forEach((l) => l.nome_usuario && s.add(l.nome_usuario));
        return Array.from(s).sort();
    }, [logs]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
        setFilters({
            usuario: '',
            cliente: '',
            statusCliente: '',
            solucao: ''
        });
        setSearchTerm('');
    };

    const logsFiltrados = useMemo(() => {
        return logs.filter((l) => {
            const usuario = (l.nome_usuario || "").toString();
            const contrato = contratosMap[l.id_contrato];
            const cliente = contrato ? clientesMap[contrato.id_cliente] : null;
            const clienteNome = cliente ? cliente.nome_fantasia : "";
            const produto = contrato ? produtosMap[contrato.id_produto] : null;

            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                (usuario).toLowerCase().includes(searchLower) ||
                (clienteNome).toLowerCase().includes(searchLower) ||
                (l.alteracao || '').toLowerCase().includes(searchLower);

            const matchesUsuario = !filters.usuario || usuario === filters.usuario;
            const matchesCliente = !filters.cliente || clienteNome === filters.cliente;
            const matchesStatusCliente = !filters.statusCliente || (cliente && cliente.status === filters.statusCliente);
            const matchesSolucao = !filters.solucao || (produto && produto.nome === filters.solucao);

            return matchesSearch && matchesUsuario && matchesCliente && matchesStatusCliente && matchesSolucao;
        });
    }, [logs, filters, searchTerm, contratosMap, clientesMap, produtosMap]);

    const dadosExportacao = useMemo(() => {
        const exportData = [];
        logsFiltrados.forEach((l) => {
            const contrato = contratosMap[l.id_contrato];
            const cliente = contrato ? clientesMap[contrato.id_cliente] : null;
            const produto = contrato ? produtosMap[contrato.id_produto] : null;

            const linhasAlteracao = (l.alteracao || "")
                .split(";")
                .map((s) => s.trim())
                .filter(Boolean);

            if (linhasAlteracao.length === 0) {
                exportData.push({
                    Usuario: l.nome_usuario || "Sistema",
                    Cliente: cliente ? cliente.nome_fantasia : "Desconhecido",
                    StatusCliente: cliente ? cliente.status || "" : "",
                    Solucao: produto ? produto.nome : "Desconhecido",
                    Alteracao: "",
                    Data: l.createdAt ? new Date(l.createdAt).toLocaleString("pt-BR") : "",
                });
            } else {
                linhasAlteracao.forEach((linha) => {
                    exportData.push({
                        Usuario: l.nome_usuario || "Sistema",
                        Cliente: cliente ? cliente.nome_fantasia : "Desconhecido",
                        StatusCliente: cliente ? cliente.status || "" : "",
                        Solucao: produto ? produto.nome : "Desconhecido",
                        Alteracao: linha,
                        Data: l.createdAt ? new Date(l.createdAt).toLocaleString("pt-BR") : "",
                    });
                });
            }
        });
        return exportData;
    }, [logsFiltrados, contratosMap, clientesMap, produtosMap]);

    const handleExport = () => {
        exportToExcel(dadosExportacao, "relatorio_logs");
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar usuário, cliente ou alteração..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full"
                    />
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Button variant="outline" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
                        Filtros
                    </Button>
                    <Button variant="primary" icon={Download} onClick={handleExport} disabled={loading}>
                        {loading ? "Carregando..." : "Exportar Excel"}
                    </Button>
                </div>
            </div>

            {showFilters && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Usuário</label>
                        <select name="usuario" value={filters.usuario} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todos</option>
                            {usuarios.map(u => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Cliente</label>
                        <select name="cliente" value={filters.cliente} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todos</option>
                            {clientesNomes.map(cn => (
                                <option key={cn} value={cn}>{cn}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status Cliente</label>
                        <select name="statusCliente" value={filters.statusCliente} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todos</option>
                            {listaStatus.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Solução</label>
                        <select name="solucao" value={filters.solucao} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todas</option>
                            {listaProdutos.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-4 flex justify-end">
                        <Button variant="ghost" icon={X} onClick={clearFilters} className="text-slate-500 dark:text-slate-400">Limpar Filtros</Button>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 bg-white dark:bg-slate-900/50 z-10 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    </div>
                )}
                <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700 sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Usuário</th>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Solução</th>
                                <th className="px-6 py-3">Status Cliente</th>
                                <th className="px-6 py-3">Alteração</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logsFiltrados.slice(0, 500).map((l, index) => {
                                const contrato = contratosMap[l.id_contrato];
                                const cliente = contrato ? clientesMap[contrato.id_cliente] : null;
                                const produto = contrato ? produtosMap[contrato.id_produto] : null;
                                const dataFormatada = l.createdAt ? new Date(l.createdAt).toLocaleString("pt-BR") : "";

                                return (
                                    <tr key={index} className="hover:bg-slate-50 dark:bg-slate-800/50">
                                        <td className="px-6 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{dataFormatada}</td>
                                        <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{l.nome_usuario || 'Sistema'}</td>
                                        <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100">{cliente?.nome_fantasia || '-'}</td>
                                        <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{produto?.nome || '-'}</td>
                                        <td className="px-6 py-3">
                                            <Badge variant={(cliente?.status || '').toLowerCase() === 'ativo' ? 'success' : 'secondary'}>{cliente?.status || '-'}</Badge>
                                        </td>
                                        <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                                            <div className="max-w-md truncate" title={l.alteracao}>
                                                {l.alteracao || '-'}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {!loading && logsFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                        Nenhum log encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                    <span>Mostrando {Math.min(logsFiltrados.length, 500)} de {logsFiltrados.length} registro(s)</span>
                    {logsFiltrados.length > 500 && (
                        <span className="text-amber-600">Para ver todos, exporte o CSV.</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LogsReport;
