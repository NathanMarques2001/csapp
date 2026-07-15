import { useState, useEffect, useMemo } from 'react';
import { CSVLink } from 'react-csv';
import { Download, Filter, Search, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import Api from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';

const GeneralReport = ({ clients, products, usersMap }) => {
    const api = new Api();
    const [loading, setLoading] = useState(true);
    const [dados, setDados] = useState([]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        nome_fantasia: '',
        produto: '',
        vendedor: '',
        vp: '',
        status_contrato: '',
        status_cliente: '',
    });

    useEffect(() => {
        const fetchGeral = async () => {
            try {
                setLoading(true);
                const res = await api.get("/relatorios/geral");
                setDados(res || []);
            } catch (error) {
                console.error("Erro ao buscar relatório geral:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGeral();
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
        setFilters({
            nome_fantasia: '',
            produto: '',
            vendedor: '',
            vp: '',
            status_contrato: '',
            status_cliente: '',
        });
        setSearchTerm('');
    };

    const dadosFiltrados = useMemo(() => {
        return dados.filter((item) => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                (item.nome_fantasia || '').toLowerCase().includes(searchLower) ||
                (item.razao_social || '').toLowerCase().includes(searchLower) ||
                (item.cpf_cnpj || '').includes(searchLower);

            const matchesNome = !filters.nome_fantasia || (item.nome_fantasia || '').toLowerCase() === filters.nome_fantasia.toLowerCase();
            const matchesProduto = !filters.produto || (item.solucao || '') === filters.produto;
            const matchesVendedor = !filters.vendedor || (item.vendedor || '') === filters.vendedor;
            const matchesVp = !filters.vp || (item.vp || '') === filters.vp;
            const matchesStatusContrato = !filters.status_contrato || (item.status_contrato || '').toLowerCase() === filters.status_contrato.toLowerCase();
            const matchesStatusCliente = !filters.status_cliente || (item.status || '').toLowerCase() === filters.status_cliente.toLowerCase();

            return matchesSearch && matchesNome && matchesProduto && matchesVendedor && matchesVp && matchesStatusContrato && matchesStatusCliente;
        });
    }, [dados, filters, searchTerm]);

    const csvData = useMemo(() => {
        return dadosFiltrados.map((item) => ({
            "Razão Social": item.razao_social || "",
            "Nome Fantasia": item.nome_fantasia || "",
            "CPF/CNPJ": item.cpf_cnpj || "",
            "Solução": item.solucao || "",
            "Valor Contrato": parseFloat(item.valor_contrato || 0),
            "Data Início": item.data_inicio ? new Date(item.data_inicio).toLocaleDateString("pt-BR") : "-",
            "Data de Vencimento": item.vencimento_calculado ? new Date(item.vencimento_calculado).toLocaleDateString("pt-BR") : "-",
            "Cadastro do Cliente": item.data_criacao_cliente ? new Date(item.data_criacao_cliente).toLocaleDateString("pt-BR") : "-",
            "Vendedor": item.vendedor || "",
            "VP": item.vp || "Desconhecido",
            "Status Cliente": item.status || "",
            "Status Contrato": item.status_contrato || "",
            "Gestor Chamados": item.gestor_chamados_nome || "",
            "Email Gestor Chamados": item.gestor_chamados_email || "",
            "Tel 1 Gestor Chamados": item.gestor_chamados_telefone_1 || "",
            "Tel 2 Gestor Chamados": item.gestor_chamados_telefone_2 || "",
            "Gestor Financeiro": item.gestor_financeiro_nome || "",
            "Email Gestor Financeiro": item.gestor_financeiro_email || "",
            "Tel 1 Gestor Financeiro": item.gestor_financeiro_telefone_1 || "",
            "Tel 2 Gestor Financeiro": item.gestor_financeiro_telefone_2 || "",
            "Gestor Contratos": item.gestor_contratos_nome || "",
            "Email Gestor Contratos": item.gestor_contratos_email || "",
            "Tel 1 Gestor Contratos": item.gestor_contratos_telefone_1 || "",
            "Tel 2 Gestor Contratos": item.gestor_contratos_telefone_2 || "",
        }));
    }, [dadosFiltrados]);

    const totalValor = dadosFiltrados.reduce((acc, curr) => acc + parseFloat(curr.valor_contrato || 0), 0);

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-lg border border-slate-200 gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar cliente, razão social..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full"
                    />
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Button variant="outline" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
                        Filtros
                    </Button>
                    <CSVLink data={csvData} filename={"relatorio_geral.csv"} className="btn-export">
                        <Button variant="primary" icon={Download} disabled={loading}>
                            {loading ? "Carregando..." : "Exportar CSV"}
                        </Button>
                    </CSVLink>
                </div>
            </div>

            {showFilters && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Cliente (Nome Fantasia)</label>
                        <select name="nome_fantasia" value={filters.nome_fantasia} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                            <option value="">Todos</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.nome_fantasia}>{c.nome_fantasia}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Produto</label>
                        <select name="produto" value={filters.produto} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                            <option value="">Todos</option>
                            {produtos.map((p) => (
                                <option key={p.id} value={p.nome}>{p.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Vendedor</label>
                        <select name="vendedor" value={filters.vendedor} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                            <option value="">Todos</option>
                            {Object.values(usuariosMap || {}).map((u) => (
                                <option key={u.id} value={u.nome}>{u.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">VP</label>
                        <select name="vp" value={filters.vp} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                            <option value="">Todos</option>
                            {Object.values(usuariosMap || {}).map((u) => (
                                <option key={u.id} value={u.nome}>{u.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Status Contrato</label>
                        <select name="status_contrato" value={filters.status_contrato} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                            <option value="">Todos</option>
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Status Cliente</label>
                        <select name="status_cliente" value={filters.status_cliente} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                            <option value="">Todos</option>
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                        </select>
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                        <Button variant="ghost" icon={X} onClick={clearFilters} className="text-slate-500">Limpar Filtros</Button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    </div>
                )}
                <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 whitespace-nowrap">Nome Fantasia</th>
                                <th className="px-6 py-3 whitespace-nowrap">CPF/CNPJ</th>
                                <th className="px-6 py-3 whitespace-nowrap">Solução</th>
                                <th className="px-6 py-3 text-right whitespace-nowrap">Valor</th>
                                <th className="px-6 py-3 whitespace-nowrap">Vendedor</th>
                                <th className="px-6 py-3 whitespace-nowrap">VP</th>
                                <th className="px-6 py-3 whitespace-nowrap">Status Cli.</th>
                                <th className="px-6 py-3 whitespace-nowrap">Status Cont.</th>
                                <th className="px-6 py-3 whitespace-nowrap">Gestor Chamados</th>
                                <th className="px-6 py-3 whitespace-nowrap">Gestor Financeiro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {dadosFiltrados.map((item, index) => (
                                <tr key={index} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-900">{item.nome_fantasia || '-'}</td>
                                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">{item.cpf_cnpj || '-'}</td>
                                    <td className="px-6 py-3 text-slate-500">{item.solucao || '-'}</td>
                                    <td className="px-6 py-3 text-right font-medium text-slate-700">{formatCurrency(item.valor_contrato || 0)}</td>
                                    <td className="px-6 py-3 text-slate-500">{item.vendedor || '-'}</td>
                                    <td className="px-6 py-3 text-slate-500">{item.vp || '-'}</td>
                                    <td className="px-6 py-3">
                                        <Badge variant={(item.status || '').toLowerCase() === 'ativo' ? 'success' : 'secondary'}>{item.status || '-'}</Badge>
                                    </td>
                                    <td className="px-6 py-3">
                                        <Badge variant={(item.status_contrato || '').toLowerCase() === 'ativo' ? 'success' : 'secondary'}>{item.status_contrato || '-'}</Badge>
                                    </td>
                                    <td className="px-6 py-3 text-slate-500">{item.gestor_chamados_nome || '-'}</td>
                                    <td className="px-6 py-3 text-slate-500">{item.gestor_financeiro_nome || '-'}</td>
                                </tr>
                            ))}
                            {!loading && dadosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan="10" className="px-6 py-8 text-center text-slate-500">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold text-slate-900 sticky bottom-0 border-t border-slate-200">
                            <tr>
                                <td colSpan="3" className="px-6 py-3 text-right">Total:</td>
                                <td className="px-6 py-3 text-right">{formatCurrency(totalValor)}</td>
                                <td colSpan="6"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500">
                    Mostrando {dadosFiltrados.length} registro(s)
                </div>
            </div>
        </div>
    );
};

export default GeneralReport;
