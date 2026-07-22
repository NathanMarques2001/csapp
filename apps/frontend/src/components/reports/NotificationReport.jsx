import { useState, useEffect, useMemo } from 'react';
import { Download, Search, Filter, X } from 'lucide-react';
import { exportToExcel } from '../../utils/excel';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import Api from '../../utils/api';

const NotificationReport = ({ usersMap, contracts, clients, products }) => {
    const api = new Api();
    const [loading, setLoading] = useState(true);
    const [notificacoes, setNotificacoes] = useState([]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        usuario: '',
        modulo: '',
        confirmado: '',
        cliente: '',
        solucao: '',
        indiceReajuste: '',
        renovacaoAutomatica: ''
    });

    useEffect(() => {
        const fetchNotificacoes = async () => {
            try {
                setLoading(true);
                const res = await api.get("/notificacoes");
                setNotificacoes(res.notificacoes || res || []);
            } catch (error) {
                console.error("Erro ao buscar notificações:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotificacoes();
    }, []);

    const contratosMap = useMemo(() => contracts.reduce((map, c) => ((map[c.id] = c), map), {}), [contracts]);
    const clientesMap = useMemo(() => clients.reduce((map, c) => ((map[c.id] = c), map), {}), [clients]);
    const produtosMap = useMemo(() => products.reduce((map, p) => ((map[p.id] = p), map), {}), [products]);

    const modulos = useMemo(() => {
        const s = new Set();
        notificacoes.forEach((n) => n.modulo && s.add(n.modulo));
        return Array.from(s);
    }, [notificacoes]);

    const indicesReajuste = useMemo(() => {
        const s = new Set();
        contracts.forEach((c) => c.nome_indice && s.add(c.nome_indice.toUpperCase()));
        return Array.from(s);
    }, [contracts]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
        setFilters({
            usuario: '',
            modulo: '',
            confirmado: '',
            cliente: '',
            solucao: '',
            indiceReajuste: '',
            renovacaoAutomatica: ''
        });
        setSearchTerm('');
    };

    const notificacoesFiltradas = useMemo(() => {
        return notificacoes.filter((n) => {
            const nomeUsuario = usersMap[n.id_usuario]?.nome;
            const confirmadoStr = n.confirmado_sn ? "sim" : "não";
            const contrato = contratosMap[n.id_contrato];
            const cliente = contrato ? clientesMap[contrato.id_cliente] : null;
            const produto = contrato ? produtosMap[contrato.id_produto] : null;

            const indiceReajusteVal = contrato?.nome_indice ? contrato.nome_indice.toUpperCase() : "";
            const renovacaoAutomaticaVal = contrato ? (contrato.renovacao_automatica ? "sim" : "não") : "não";

            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                (cliente?.razao_social || '').toLowerCase().includes(searchLower) ||
                (n.descricao || '').toLowerCase().includes(searchLower);

            const matchesUsuario = !filters.usuario || nomeUsuario === filters.usuario;
            const matchesModulo = !filters.modulo || n.modulo === filters.modulo;
            const matchesConfirmado = !filters.confirmado || confirmadoStr === filters.confirmado;
            const matchesCliente = !filters.cliente || (cliente && cliente.razao_social === filters.cliente);
            const matchesSolucao = !filters.solucao || (produto && produto.nome === filters.solucao);
            const matchesIndice = !filters.indiceReajuste || indiceReajusteVal === filters.indiceReajuste;
            const matchesRenovacao = !filters.renovacaoAutomatica || renovacaoAutomaticaVal === filters.renovacaoAutomatica;

            return matchesSearch && matchesUsuario && matchesModulo && matchesConfirmado && matchesCliente && matchesSolucao && matchesIndice && matchesRenovacao;
        });
    }, [notificacoes, filters, searchTerm, usersMap, contratosMap, clientesMap, produtosMap]);

    const csvData = useMemo(() => {
        return notificacoesFiltradas.map((n) => {
            const contrato = contratosMap[n.id_contrato];
            const cliente = contrato ? clientesMap[contrato.id_cliente] : null;
            const produto = contrato ? produtosMap[contrato.id_produto] : null;

            return {
                "Vendedor": usersMap[n.id_usuario]?.nome || "Desconhecido",
                "Cliente": cliente ? cliente.razao_social : "Desconhecido",
                "Solucao": produto ? produto.nome : "Desconhecido",
                "Descricao": n.descricao || "",
                "Modulo": n.modulo || "",
                "Confirmado": n.confirmado_sn ? "Sim" : "Não",
                "Índice de Reajuste": contrato ? (contrato.nome_indice ? contrato.nome_indice.toUpperCase() : "N/A") : "N/A",
                "Renovação Automática": contrato ? (contrato.renovacao_automatica ? "Sim" : "Não") : "Não",
                "ID Contrato": n.id_contrato || "",
            };
        });
    }, [notificacoesFiltradas, usersMap, contratosMap, clientesMap, produtosMap]);

    const handleExport = () => {
        exportToExcel(csvData, "relatorio_notificacoes");
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar notificação ou cliente..."
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
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Vendedor</label>
                        <select name="usuario" value={filters.usuario} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todos</option>
                            {Object.values(usersMap || {}).map((u) => (
                                <option key={u.id} value={u.nome}>{u.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Módulo</label>
                        <select name="modulo" value={filters.modulo} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todos</option>
                            {modulos.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Cliente</label>
                        <select name="cliente" value={filters.cliente} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todos</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.razao_social}>{c.razao_social}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Solução</label>
                        <select name="solucao" value={filters.solucao} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todas</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.nome}>{p.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmado</label>
                        <select name="confirmado" value={filters.confirmado} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todos</option>
                            <option value="sim">Sim</option>
                            <option value="não">Não</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Índice Reajuste</label>
                        <select name="indiceReajuste" value={filters.indiceReajuste} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="">Todos</option>
                            {indicesReajuste.map((i) => (
                                <option key={i} value={i}>{i}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Renovação Automática</label>
                        <select name="renovacaoAutomatica" value={filters.renovacaoAutomatica} onChange={handleFilterChange} className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
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
                {loading && (
                    <div className="absolute inset-0 bg-white dark:bg-slate-900/50 z-10 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    </div>
                )}
                <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700 sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Vendedor</th>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Solução</th>
                                <th className="px-6 py-3">Descrição</th>
                                <th className="px-6 py-3">Módulo</th>
                                <th className="px-6 py-3">Confirmado</th>
                                <th className="px-6 py-3">Índice de Reajuste</th>
                                <th className="px-6 py-3">Renovação Automática</th>
                                <th className="px-6 py-3">ID Contrato</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {csvData.map((c, index) => (
                                <tr key={index} className="hover:bg-slate-50 dark:bg-slate-800/50">
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{c["Vendedor"]}</td>
                                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100">{c["Cliente"]}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{c["Solucao"]}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={c["Descricao"]}>{c["Descricao"]}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{c["Modulo"]}</td>
                                    <td className="px-6 py-3">
                                        <Badge variant={c["Confirmado"] === "Sim" ? 'success' : 'secondary'}>{c["Confirmado"]}</Badge>
                                    </td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{c["Índice de Reajuste"]}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{c["Renovação Automática"]}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{c["ID Contrato"]}</td>
                                </tr>
                            ))}
                            {!loading && csvData.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    Mostrando {notificacoesFiltradas.length} registro(s)
                </div>
            </div>
        </div>
    );
};

export default NotificationReport;
