import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronLeft, ChevronRight, Pencil, FileText, TrendingUp, DollarSign, Upload, Filter } from 'lucide-react';
import Api from '../utils/api';
import { formatCurrency, formatDate, formatCpfCnpj } from '../utils/formatters';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import Input from '../components/ui/Input';
import ImportContractsModal from '../components/contracts/ImportContractsModal';
import FilterModal from '../components/contracts/FilterModal';

const Contracts = () => {
    const api = new Api();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [contracts, setContracts] = useState([]);
    const [filteredContracts, setFilteredContracts] = useState([]);
    const [clients, setClients] = useState({});
    const [products, setProducts] = useState({});
    const [users, setUsers] = useState({});

    // Import Modal State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Filters State
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState({
        razao_social: "",
        nome_fantasia: "",
        status: "", // Default to active as per legacy behavior or just ""? Legacy default was "ativo" in one state init but "" in others. Let's start with empty or "ativo". Legacy 'filtros' init was {status: "ativo"}.
        nome_produto: "",
        tipo_faturamento: "",
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [contractsRes, clientsRes, productsRes, usersRes] = await Promise.all([
                    api.get('/contratos'),
                    api.get('/clientes'),
                    api.get('/produtos'),
                    api.get('/usuarios')
                ]);

                // Map clients by ID
                const clientsMap = (clientsRes.clientes || []).reduce((acc, c) => ({ ...acc, [c.id]: c }), {});
                // Map products by ID
                const productsMap = (productsRes.produtos || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
                // Map users (sellers) by ID
                const usersMap = (usersRes.usuarios || []).reduce((acc, u) => ({ ...acc, [u.id]: u }), {});

                setClients(clientsMap);
                setProducts(productsMap);
                setUsers(usersMap);

                // Backend returns snake_case fields: id_cliente, id_produto, valor_mensal, etc.
                const contractsData = contractsRes.contratos || [];
                setContracts(contractsData);
                setFilteredContracts(contractsData);
            } catch (error) {
                console.error("Error loading contracts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let results = contracts;

        // 1. Text Search (Client Name)
        if (searchTerm) {
            const termLower = searchTerm.toLowerCase();
            results = results.filter(c => {
                const client = clients[c.id_cliente];
                return client?.nome_fantasia?.toLowerCase().includes(termLower) ||
                    client?.razao_social?.toLowerCase().includes(termLower);
            });
        }

        // 2. Advanced Filters
        if (activeFilters.status) {
            results = results.filter(c => c.status === activeFilters.status);
        }

        if (activeFilters.razao_social) {
            const termLower = activeFilters.razao_social.toLowerCase();
            results = results.filter(c => clients[c.id_cliente]?.razao_social?.toLowerCase().includes(termLower));
        }

        if (activeFilters.nome_fantasia) {
            const termLower = activeFilters.nome_fantasia.toLowerCase();
            results = results.filter(c => clients[c.id_cliente]?.nome_fantasia?.toLowerCase().includes(termLower));
        }

        if (activeFilters.nome_produto) {
            const termLower = activeFilters.nome_produto.toLowerCase();
            results = results.filter(c => products[c.id_produto]?.nome?.toLowerCase().includes(termLower));
        }

        if (activeFilters.tipo_faturamento) {
            results = results.filter(c => c.tipo_faturamento === activeFilters.tipo_faturamento);
        }

        setFilteredContracts(results);
        setCurrentPage(1);
    }, [searchTerm, activeFilters, contracts, clients, products]);

    // Calculations
    const calculateContractValue = (value) => {
        return parseFloat(value || 0);
    };

    const totalActive = filteredContracts.reduce((acc, c) => acc + (c.status === 'ativo' ? calculateContractValue(c.valor_mensal) : 0), 0);
    const totalMonthly = filteredContracts.reduce((acc, c) => acc + (c.tipo_faturamento === 'mensal' ? calculateContractValue(c.valor_mensal) : 0), 0);
    const totalAnnual = filteredContracts.reduce((acc, c) => acc + (c.tipo_faturamento === 'anual' ? calculateContractValue(c.valor_mensal) : 0), 0);
    const totalDisplayed = filteredContracts.reduce((acc, c) => acc + calculateContractValue(c.valor_mensal), 0);

    const totalsByBillingType = filteredContracts.reduce((acc, c) => {
        const type = c.tipo_faturamento || 'Não especificado';
        const value = calculateContractValue(c.valor_mensal);
        if (!acc[type]) acc[type] = 0;
        acc[type] += value;
        return acc;
    }, {});

    const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
    const paginatedContracts = filteredContracts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Import & Download Logic
    const handleDownloadTemplate = () => {
        const rows = [
            ["cpf_cnpj", "nome_produto", "nome_faturado", "dia_vencimento", "nome_indice", "proximo_reajuste", "status", "duracao", "valor_mensal", "quantidade", "descricao", "data_inicio", "tipo_faturamento", "renovacao_automatica"],
            ["00.000.000/0001-00", "Produto Exemplo", "Faturado Por", "10", "IPCA", "2025-07-15", "ativo", "12", "1500.50", "1", "Detalhes...", "2024-07-15", "mensal", "false"]
        ];

        let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(";")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "modelo_contratos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            const response = await api.post("/contratos/importar-excel", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert(response.message || "Importação realizada com sucesso!");
            window.location.reload();
        } catch (error) {
            console.error("Erro importação:", error);
            alert("Erro ao importar. Verifique o console para mais detalhes.");
        } finally {
            setLoading(false);
            setIsImportModalOpen(false);
        }
    };

    const handleApplyFilters = (filters) => {
        setActiveFilters(filters);
        setIsFilterModalOpen(false);
    };

    const StatsCard = ({ title, value, icon: Icon, color }) => (
        <Card className="border-none shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500 font-medium">{title}</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(value)}</p>
                </div>
                <div className={`p-3 rounded-full ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Contratos</h1>
                    <p className="text-slate-500">Gestão de contratos e faturamentos</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setIsImportModalOpen(true)} icon={Upload}>Importar</Button>
                    <Button onClick={() => navigate('/contratos/novo')} icon={Plus}>Novo Contrato</Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard title="Total Ativo (Filtro)" value={totalActive} icon={TrendingUp} color="bg-teal-500" />
                <StatsCard title="Faturamento Mensal" value={totalMonthly} icon={DollarSign} color="bg-indigo-500" />
                <StatsCard title="Faturamento Anual" value={totalAnnual} icon={FileText} color="bg-blue-500" />
                <StatsCard title="Total Geral (Filtro)" value={totalDisplayed} icon={DollarSign} color="bg-slate-500" />
            </div>

            {/* Filter Bar */}
            <div className="p-4 rounded-lg border border-slate-200 shadow-sm bg-white flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Buscar por cliente..."
                        className="pl-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" onClick={() => setIsFilterModalOpen(true)} icon={Filter}>
                        Filtrar
                    </Button>
                    {/* Show active filter count/clear functionality could be added here */}
                </div>
            </div>

            {/* Active Filters Display */}
            {Object.values(activeFilters).some(Boolean) && (
                <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-slate-500 self-center">Filtros ativos:</span>
                    {Object.entries(activeFilters).map(([key, value]) => {
                        if (!value) return null;
                        return (
                            <Badge key={key} variant="secondary" className="flex items-center gap-1">
                                {key.replace('_', ' ')}: {value}
                                <span className="cursor-pointer ml-1 hover:text-red-500" onClick={() => setActiveFilters(prev => ({ ...prev, [key]: '' }))}>×</span>
                            </Badge>
                        )
                    })}
                    <Button variant="ghost" size="sm" className="text-slate-500 h-6" onClick={() => setActiveFilters({ razao_social: "", nome_fantasia: "", status: "", nome_produto: "", tipo_faturamento: "" })}>Limpar tudo</Button>
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3">Cliente</th>
                                    <th className="px-6 py-3">CPF/CNPJ</th>
                                    <th className="px-6 py-3">Produto</th>
                                    <th className="px-6 py-3">Valor</th>
                                    <th className="px-6 py-3">Faturamento</th>
                                    <th className="px-6 py-3">Vendedor</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                    <th className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedContracts.length > 0 ? (
                                    paginatedContracts.map((contract) => {
                                        const client = clients[contract.id_cliente];
                                        const product = products[contract.id_produto];
                                        const seller = client ? users[client.id_usuario] : null;

                                        return (
                                            <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    {client?.nome_fantasia || 'Cliente Desconhecido'}
                                                    <div className="text-xs text-slate-500 font-normal">{client?.razao_social}</div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                                    {formatCpfCnpj(client?.cpf_cnpj)}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-700">
                                                    {product?.nome || `Produto ${contract.id_produto} `}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-700">{formatCurrency(contract.valor_mensal)}</td>
                                                <td className="px-6 py-4 text-slate-500">{contract.tipo_faturamento.replace(contract.tipo_faturamento[0], contract.tipo_faturamento[0].toUpperCase())}</td>
                                                <td className="px-6 py-4 text-slate-500">{seller?.nome || '-'}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge status={contract.status} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-slate-400 hover:text-slate-600" onClick={() => navigate(`/contratos/${contract.id}/editar`)}>
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                </td >
                                            </tr >
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-8 text-center text-slate-500">
                                            Nenhum contrato encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody >
                            <tfoot className="bg-slate-50 font-semibold text-slate-900 border-t border-slate-200">
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-right">
                                        Total (Página):
                                    </td>
                                    <td className="px-6 py-4 text-teal-700">
                                        {formatCurrency(paginatedContracts.reduce((acc, c) => acc + calculateContractValue(c.valor_mensal), 0))}
                                    </td>
                                    <td colSpan="6"></td>
                                </tr>
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-right border-t border-slate-200">
                                        Total Geral (Filtro):
                                    </td>
                                    <td className="px-6 py-4 text-indigo-700 border-t border-slate-200">
                                        {formatCurrency(totalDisplayed)}
                                    </td>
                                    <td colSpan="6" className="border-t border-slate-200"></td>
                                </tr>
                                {Object.entries(totalsByBillingType).sort().map(([type, total]) => (
                                    <tr key={type}>
                                        <td colSpan="3" className="px-6 py-2 text-right text-slate-500 font-normal text-xs">
                                            Total {type}:
                                        </td>
                                        <td className="px-6 py-2 text-slate-700 text-xs">
                                            {formatCurrency(total)}
                                        </td>
                                        <td colSpan="6"></td>
                                    </tr>
                                ))}
                            </tfoot>
                        </table >
                    </div >

                    {/* Pagination */}
                    {
                        totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                                <span className="text-slate-500 text-sm">
                                    Página {currentPage} de {totalPages}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    ><ChevronLeft className="w-4 h-4" /></Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    ><ChevronRight className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        )
                    }
                </div >
            )}

            <ImportContractsModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImport}
                onDownloadTemplate={handleDownloadTemplate}
            />

            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={handleApplyFilters}
                initialFilters={activeFilters}
                clients={clients}
                products={products}
            />
        </div >
    );
};

export default Contracts;
