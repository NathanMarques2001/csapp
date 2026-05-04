import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, ChevronDown, ChevronRight, Building, MoreVertical, Edit2 } from 'lucide-react';
import { FaEye, FaPencilAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Api from '../utils/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import Input from '../components/ui/Input';
import { GroupFormModal } from '../components/settings/SettingsModals';
import ClientFilterModal from '../components/clients/ClientFilterModal';


const Clients = () => {
    const api = new Api();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);
    const [groups, setGroups] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [sellers, setSellers] = useState({});
    const [classifications, setClassifications] = useState({});

    const [searchTerm, setSearchTerm] = useState('');
    const [expandedGroups, setExpandedGroups] = useState([]);

    // Group Modal State
    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);

    // Filter State
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: 'ativo',
        classification: '',
        seller: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [clientsRes, groupsRes, classificationsRes, contractsRes, sellersRes] = await Promise.all([
                api.get('/clientes'),
                api.get('/grupos-economicos'),
                api.get('/classificacoes-clientes'),
                api.get('/contratos'),
                api.get('/usuarios')
            ]);
            setClients(clientsRes.clientes || []);
            setGroups(groupsRes.grupoEconomico || []);
            setContracts(contractsRes.contratos || []);

            const sellersMap = (sellersRes.usuarios || []).reduce((acc, curr) => {
                acc[curr.id] = curr.nome;
                return acc;
            }, {});
            setSellers(sellersMap);

            const classMap = (classificationsRes.classificacoes || []).reduce((acc, curr) => {
                acc[curr.id] = curr.nome;
                return acc;
            }, {});
            setClassifications(classMap);

            // Expand first group by default if exists
            if (groupsRes.grupoEconomico && groupsRes.grupoEconomico.length > 0) {
                setExpandedGroups([groupsRes.grupoEconomico[0].id]);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleGroup = (id) => {
        setExpandedGroups(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );
    };

    const getClientsByGroup = (groupId) => {
        return clients.filter(c => {
            // Search Filter
            const matchesSearch = searchTerm === '' ||
                (c.nome_fantasia || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.razao_social || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.cpf_cnpj || '').includes(searchTerm);

            // Advanced Filters
            const matchesStatus = filters.status === '' || (c.status || '').toLowerCase() === filters.status;
            const matchesClass = filters.classification === '' || String(c.id_classificacao_cliente) === String(filters.classification);
            const matchesSeller = filters.seller === '' || String(c.id_usuario) === String(filters.seller);

            return c.id_grupo_economico === groupId && matchesSearch && matchesStatus && matchesClass && matchesSeller;
        });
    };

    const clientsWithoutGroup = clients.filter(c => {
        // Search Filter
        const matchesSearch = searchTerm === '' ||
            (c.nome_fantasia || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.razao_social || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.cpf_cnpj || '').includes(searchTerm);

        // Advanced Filters
        const matchesStatus = filters.status === '' || (c.status || '').toLowerCase() === filters.status;
        const matchesClass = filters.classification === '' || String(c.id_classificacao_cliente) === String(filters.classification);
        const matchesSeller = filters.seller === '' || String(c.id_usuario) === String(filters.seller);

        return !c.id_grupo_economico && matchesSearch && matchesStatus && matchesClass && matchesSeller;
    });

    const filteredGroups = groups.filter(g => {
        // Check if group matches search
        const matchesGroupName = g.nome.toLowerCase().includes(searchTerm.toLowerCase());

        // Check if group has ANY children that match ALL filters
        const groupChildren = clients.filter(c => c.id_grupo_economico === g.id);
        const hasMatchingChildren = groupChildren.some(c => {
            // Search Filter
            const matchesSearch = searchTerm === '' ||
                (c.nome_fantasia || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.razao_social || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.cpf_cnpj || '').includes(searchTerm);

            // Advanced Filters
            const matchesStatus = filters.status === '' || (c.status || '').toLowerCase() === filters.status;
            const matchesClass = filters.classification === '' || String(c.id_classificacao_cliente) === String(filters.classification);
            const matchesSeller = filters.seller === '' || String(c.id_usuario) === String(filters.seller);

            return matchesSearch && matchesStatus && matchesClass && matchesSeller;
        });

        // If search term is present, we show group if name matches OR children match.
        // If advanced filters are present, we ONLY show group if it has matching children (otherwise it's empty group which is distracting when filtering for specific criteria)
        // BUT legacy might show empty groups? Let's assume we want to see relevant data.
        // If I select "Status: Inativo", I only want groups that have Inactive clients.

        if (searchTerm !== '' && matchesGroupName) return true; // Always show group if name matches search

        return hasMatchingChildren;
    });

    const calculateContractTotal = (clientId) => {
        return contracts
            .filter(c => c.id_cliente == clientId && (c.status === 'ativo' || c.status === 'Ativo'))
            .reduce((sum, c) => {
                // Handle string with comma decimal separator if necessary, though Sequelize usually returns dot
                let val = c.valor_mensal;
                if (typeof val === 'string') {
                    val = val.replace(',', '.');
                }
                return sum + parseFloat(val || 0);
            }, 0);
    };

    const calculateGroupTotal = (groupId) => {
        const groupClients = clients.filter(c => c.id_grupo_economico === groupId);
        return groupClients.reduce((sum, client) => {
            return sum + calculateContractTotal(client.id);
        }, 0);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const handleNewGroup = () => {
        setEditingGroup(null);
        setGroupModalOpen(true);
    };

    const handleEditGroup = (e, group) => {
        e.stopPropagation();
        setEditingGroup(group);
        setGroupModalOpen(true);
    };

    const handleGroupSuccess = () => {
        setGroupModalOpen(false);
        fetchData(); // Reload data to reflect changes
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Carteira de Clientes</h1>
                    <p className="text-slate-500">Visão hierárquica de Grupos Econômicos e Empresas.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={Filter} onClick={() => setFilterModalOpen(true)}>Filtrar</Button>
                    <Button variant="outline" icon={Plus} onClick={handleNewGroup}>Novo Grupo</Button>
                    <Button onClick={() => navigate('/clientes/novo')} icon={Plus}>Novo Cliente</Button>
                </div>
            </div>

            <Card className="p-4 border-0 shadow-sm bg-white">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Buscar por cliente, grupo ou CNPJ..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 w-12"></th>
                                <th className="px-6 py-3">Nome / Razão Social</th>
                                <th className="px-6 py-3">CNPJ / Info</th>
                                <th className="px-6 py-3">Classificação</th>
                                <th className="px-6 py-3">Valor Contratos</th>
                                <th className="px-6 py-3">Vendedor</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead >
                        <tbody className="divide-y divide-slate-100">
                            {filteredGroups.map(group => (
                                <React.Fragment key={`g-${group.id}`}>
                                    <tr className="bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors" onClick={() => toggleGroup(group.id)}>
                                        <td className="px-6 py-3 text-center">
                                            {expandedGroups.includes(group.id) ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                                        </td>
                                        <td className="px-6 py-3 font-bold text-slate-800 flex items-center gap-2">
                                            <Building className="w-4 h-4 text-teal-600" />
                                            {group.nome}
                                        </td>
                                        <td className="px-6 py-3 text-slate-500 italic">{group.descricao || 'Grupo Econômico'}</td>
                                        <td className="px-6 py-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {classifications[group.id_classificacao_cliente] || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 font-semibold text-slate-700">
                                            {formatCurrency(calculateGroupTotal(group.id))}
                                        </td>
                                        <td className="px-6 py-3"></td>
                                        <td className="px-6 py-3 w-32">
                                            <Badge status={group.status || 'ativo'} />
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/grupo-economico/${group.id}`); }}
                                                    title="Ver Detalhes do Grupo"
                                                >
                                                    <FaEye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="text-slate-400 hover:text-teal-600 transition-colors p-1"
                                                    onClick={(e) => handleEditGroup(e, group)}
                                                    title="Editar Grupo"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {expandedGroups.includes(group.id) && getClientsByGroup(group.id).map(client => (
                                        <tr key={client.id} className="hover:bg-white bg-white border-l-4 border-l-transparent hover:border-l-teal-500 transition-all">
                                            <td className="px-6 py-3"></td>
                                            <td className="px-6 py-3 pl-12 flex items-center gap-2 font-medium text-slate-700">
                                                {client.nome_fantasia}
                                            </td>
                                            <td className="px-6 py-3 text-slate-500 font-mono text-xs">{client.cpf_cnpj}</td>
                                            <td className="px-6 py-3">
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                                    {classifications[client.id_classificacao_cliente] || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-slate-600 font-medium">
                                                {formatCurrency(calculateContractTotal(client.id))}
                                            </td>
                                            <td className="px-6 py-3 text-slate-500">
                                                {sellers[client.id_usuario] || '-'}
                                            </td>
                                            <td className="px-6 py-3">
                                                <Badge status={client.status} />
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button className="text-slate-400 hover:text-indigo-600 transition-colors p-1" onClick={(e) => { e.stopPropagation(); navigate(`/clientes/${client.id}`); }}>
                                                        <FaEye className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-slate-400 hover:text-teal-600 transition-colors p-1" onClick={(e) => { e.stopPropagation(); navigate(`/clientes/${client.id}/editar`); }}>
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}


                            {/* Clients without group */}
                            {clientsWithoutGroup.length > 0 && (
                                <>
                                    <tr className="bg-slate-50/80 border-t border-slate-200">
                                        <td colSpan="8" className="px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Sem Grupo
                                        </td>
                                    </tr>
                                    {clientsWithoutGroup.map(client => (
                                        <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-3"></td>
                                            <td className="px-6 py-3 font-medium text-slate-900">{client.nome_fantasia}</td>
                                            <td className="px-6 py-3 text-slate-500 font-mono text-xs">{client.cpf_cnpj}</td>
                                            <td className="px-6 py-3">
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                    {classifications[client.id_classificacao_cliente] || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-slate-600 font-medium">
                                                {formatCurrency(calculateContractTotal(client.id))}
                                            </td>
                                            <td className="px-6 py-3 text-slate-500">
                                                {sellers[client.id_usuario] || '-'}
                                            </td>
                                            <td className="px-6 py-3">
                                                <Badge status={client.status} />
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button className="text-slate-400 hover:text-indigo-600 transition-colors p-1" onClick={(e) => { e.stopPropagation(); navigate(`/clientes/${client.id}`); }}>
                                                        <FaEye className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-slate-400 hover:text-teal-600 transition-colors p-1" onClick={(e) => { e.stopPropagation(); navigate(`/clientes/${client.id}/editar`); }}>
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            )}

                            {filteredGroups.length === 0 && clientsWithoutGroup.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                                        Nenhum cliente ou grupo encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {groupModalOpen && (
                <GroupFormModal
                    group={editingGroup}
                    onClose={() => setGroupModalOpen(false)}
                    onSuccess={handleGroupSuccess}
                />
            )}

            <ClientFilterModal
                isOpen={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                onApply={setFilters}
                filters={filters}
                classifications={classifications}
                sellers={sellers}
            />

        </div>
    );
};

export default Clients;
