import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Building, Power, ArrowLeft, Calendar, DollarSign, Package, Factory, AlertTriangle, FileText, CheckCircle, XCircle, Edit2 } from "lucide-react";
import Api from "../utils/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import Badge from "../components/ui/Badge";

const EconomicGroupDetails = () => {
    const api = new Api();
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState(null);
    const [clients, setClients] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [products, setProducts] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const groupRes = await api.get(`/grupos-economicos/${id}`);
                setGroup(groupRes.grupoEconomico);

                const clientsRes = await api.get(`/clientes/grupo-economico/${id}`);
                setClients(clientsRes.clientes || []);

                // Fetch contracts for all clients
                const contractsPromises = (clientsRes.clientes || []).map(client =>
                    api.get(`/contratos/cliente/${client.id}`)
                );

                const contractsResponses = await Promise.all(contractsPromises);
                const allContracts = contractsResponses.flatMap(res => res.contratos || []);
                setContracts(allContracts);

                const [productsRes, manufacturersRes] = await Promise.all([
                    api.get("/produtos"),
                    api.get("/fabricantes")
                ]);

                setProducts(productsRes.produtos || []);
                setManufacturers(manufacturersRes.fabricantes || []);

            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const handleToggleStatus = async () => {
        const newStatus = group.status === 'ativo' ? 'inativo' : 'ativo';
        const message = newStatus === 'inativo'
            ? "Tem certeza que deseja inativar esse grupo econômico? Todos os clientes e contratos serão inativados também."
            : "Tem certeza que deseja ativar esse grupo econômico?";

        if (window.confirm(message)) {
            try {
                await api.put(`/grupos-economicos/active-inactive/${id}`);
                // Refresh data
                const groupRes = await api.get(`/grupos-economicos/${id}`);
                setGroup(groupRes.grupoEconomico);

                // Refresh clients and contracts status potentially
                const clientsRes = await api.get(`/clientes/grupo-economico/${id}`);
                setClients(clientsRes.clientes || []);

                // Re-fetch contracts
                const contractsPromises = (clientsRes.clientes || []).map(client =>
                    api.get(`/contratos/cliente/${client.id}`)
                );
                const contractsResponses = await Promise.all(contractsPromises);
                const allContracts = contractsResponses.flatMap(res => res.contratos || []);
                setContracts(allContracts);

            } catch (error) {
                console.error("Error toggling status:", error);
                alert("Erro ao alterar status do grupo.");
            }
        }
    };

    const getProductName = (id) => products.find(p => p.id === id)?.nome || "Desconhecido";
    const getManufacturerName = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return "Desconhecido";
        return manufacturers.find(m => m.id === product.id_fabricante)?.nome || "Desconhecido";
    };

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // Calculations
    const calculateClientTotal = (clientId, type) => { // type: 'mensal' | 'anual'
        return contracts
            .filter(c => c.id_cliente === clientId && c.status === 'ativo' && c.tipo_faturamento?.toLowerCase() === type)
            .reduce((sum, c) => sum + parseFloat(c.valor_mensal || 0), 0);
    };

    const calculateGroupTotal = (type) => {
        return contracts
            .filter(c => c.status === 'ativo' && c.tipo_faturamento?.toLowerCase() === type)
            .reduce((sum, c) => sum + parseFloat(c.valor_mensal || 0), 0);
    };

    if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-64 w-full" /></div>;
    if (!group) return <div className="p-6">Grupo não encontrado</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => navigate('/clientes')} icon={ArrowLeft} className="p-2" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Building className="text-teal-600" />
                            {group.nome}
                        </h1>
                        <p className="text-slate-500 text-sm">Detalhes do Grupo Econômico</p>
                    </div>
                    <Badge status={group.status || 'ativo'} className="ml-2" />
                </div>
                <Button
                    variant={group.status === 'ativo' ? 'danger' : 'success'}
                    icon={Power}
                    onClick={handleToggleStatus}
                >
                    {group.status === 'ativo' ? 'Inativar Grupo' : 'Ativar Grupo'}
                </Button>
            </div>

            {/* Clients List */}
            <div className="space-y-6">
                {clients.map(client => {
                    const clientContracts = contracts.filter(c => c.id_cliente === client.id);
                    const monthlyTotal = calculateClientTotal(client.id, 'mensal');
                    const annualTotal = calculateClientTotal(client.id, 'anual');

                    return (
                        <Card key={client.id} className="overflow-hidden border-slate-200">
                            <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-slate-800">{client.nome_fantasia}</h3>
                                        <Badge status={client.status} size="sm" />
                                        <span className="text-xs font-mono text-slate-500 bg-slate-200 px-2 py-0.5 rounded">{client.tipo_unidade}</span>
                                    </div>
                                    <p className="text-slate-500 text-sm">{client.cpf_cnpj}</p>
                                </div>
                                <div className="flex gap-6 text-sm">
                                    <div className="text-right">
                                        <p className="text-slate-500">Faturamento Mensal</p>
                                        <p className="font-bold text-slate-700">{formatCurrency(monthlyTotal)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-500">Faturamento Anual</p>
                                        <p className="font-bold text-slate-700">{formatCurrency(annualTotal)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Solução</th>
                                            <th className="px-6 py-3">Contratação</th>
                                            <th className="px-6 py-3">Valor</th>
                                            <th className="px-6 py-3">Recorrência</th>
                                            <th className="px-6 py-3">Fabricante</th>
                                            <th className="px-6 py-3 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {clientContracts.length === 0 ? (
                                            <tr><td colSpan="6" className="px-6 py-4 text-center text-slate-400 italic">Nenhum contrato encontrado</td></tr>
                                        ) : (
                                            clientContracts.map(contract => (
                                                <tr key={contract.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/contratos/${contract.id}/editar`)}>
                                                    <td className="px-6 py-3">
                                                        {contract.status === 'ativo'
                                                            ? <span className="flex items-center gap-1 text-emerald-600"><CheckCircle size={14} /> Ativo</span>
                                                            : <span className="flex items-center gap-1 text-slate-400"><XCircle size={14} /> Inativo</span>
                                                        }
                                                    </td>
                                                    <td className="px-6 py-3 font-medium text-slate-700 flex items-center gap-2">
                                                        <Package size={14} className="text-indigo-400" />
                                                        {getProductName(contract.id_produto)}
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-500">
                                                        {new Date(contract.data_inicio).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-3 font-mono text-slate-600">
                                                        {formatCurrency(parseFloat(contract.valor_mensal))}
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        {contract.duracao === 12000 ? 'Indeterminado' : `${contract.duracao} Meses`}
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-500 flex items-center gap-2">
                                                        <Factory size={14} />
                                                        {getManufacturerName(contract.id_produto)}
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            className="text-slate-400 hover:text-teal-600"
                                                            size="sm"
                                                            icon={Edit2}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/contratos/${contract.id}/editar`);
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Group Summary Footer */}
            <Card className="bg-slate-900 text-white p-6 border-0 shadow-lg mt-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-teal-500/20 rounded-full">
                            <DollarSign className="w-8 h-8 text-teal-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Resumo Financeiro do Grupo</h3>
                            <p className="text-slate-400 text-sm">Soma de todos os contratos ativos das unidades.</p>
                        </div>
                    </div>
                    <div className="flex gap-8">
                        <div className="text-right">
                            <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">Total Mensal</p>
                            <p className="text-3xl font-bold text-teal-400">{formatCurrency(calculateGroupTotal('mensal'))}</p>
                        </div>
                        <div className="text-right border-l border-slate-700 pl-8">
                            <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">Total Anual</p>
                            <p className="text-3xl font-bold text-indigo-400">{formatCurrency(calculateGroupTotal('anual'))}</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default EconomicGroupDetails;
