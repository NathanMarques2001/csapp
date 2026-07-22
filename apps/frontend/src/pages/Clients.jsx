import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, ChevronDown, ChevronRight, ChevronLeft, Building, MoreVertical, Edit2, Info, TrendingUp, DollarSign } from 'lucide-react';
import { FaEye, FaPencilAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useCookies } from "react-cookie";
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
    const [cookies] = useCookies(["id", "tipo"]);
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);
    const [groups, setGroups] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [sellers, setSellers] = useState({});
    const [classifications, setClassifications] = useState({});
    const [rawClassifications, setRawClassifications] = useState([]);

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
        seller: '',
        vp: ''
    });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 50;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

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
            let fetchedClients = clientsRes.clientes || [];
            if (cookies.tipo === "user") {
                fetchedClients = fetchedClients.filter(c => String(c.id_usuario) === String(cookies.id));
            }
            setClients(fetchedClients);
            
            setGroups(groupsRes.grupoEconomico || []);

            let fetchedContracts = contractsRes.contratos || [];
            if (cookies.tipo === "user") {
                const myClientIds = new Set(fetchedClients.map(c => c.id));
                fetchedContracts = fetchedContracts.filter(c => myClientIds.has(c.id_cliente));
            }
            setContracts(fetchedContracts);

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

            const sortedClassifications = (classificationsRes.classificacoes || []).sort((a, b) => {
                if (a.tipo_categoria === 'quantidade' && b.tipo_categoria !== 'quantidade') return -1;
                if (b.tipo_categoria === 'quantidade' && a.tipo_categoria !== 'quantidade') return 1;
                return (b.valor || 0) - (a.valor || 0);
            });
            setRawClassifications(sortedClassifications);

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
        // Returns ALL clients in the group without filtering them out individually, 
        // because the filtering is applied at the group level now.
        return clients.filter(c => c.id_grupo_economico === groupId);
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
        const matchesVp = filters.vp === '' || String(c.vp) === String(filters.vp);

        return !c.id_grupo_economico && matchesSearch && matchesStatus && matchesClass && matchesSeller && matchesVp;
    });

    const filteredGroups = groups.filter(g => {
        const groupChildren = clients.filter(c => c.id_grupo_economico === g.id);

        if (cookies.tipo === "user" && groupChildren.length === 0) {
            return false;
        }

        // 1. Search filter
        const groupMatchesSearch = searchTerm === '' || (g.nome || '').toLowerCase().includes(searchTerm.toLowerCase());
        const childMatchesSearch = searchTerm === '' || groupChildren.some(c => 
            (c.nome_fantasia || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.razao_social || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.cpf_cnpj || '').includes(searchTerm)
        );
        const matchesSearch = groupMatchesSearch || childMatchesSearch;

        // 2. Status filter
        const groupMatchesStatus = filters.status === '' || (g.status || '').toLowerCase() === filters.status;
        const childMatchesStatus = filters.status === '' || groupChildren.some(c => (c.status || '').toLowerCase() === filters.status);
        const matchesStatus = groupMatchesStatus || childMatchesStatus;

        // 3. Classification filter
        const groupMatchesClass = filters.classification === '' || String(g.id_classificacao_cliente) === String(filters.classification);
        const childMatchesClass = filters.classification === '' || groupChildren.some(c => String(c.id_classificacao_cliente) === String(filters.classification));
        const matchesClass = groupMatchesClass || childMatchesClass;

        // 4. Seller filter (groups don't have sellers, check children)
        const matchesSeller = filters.seller === '' || groupChildren.some(c => String(c.id_usuario) === String(filters.seller));

        // 5. VP filter
        const matchesVp = filters.vp === '' || groupChildren.some(c => String(c.vp) === String(filters.vp));

        return matchesSearch && matchesStatus && matchesClass && matchesSeller && matchesVp;
    });

    // Combine and paginate
    const combinedEntities = [
        ...filteredGroups.map(g => ({ type: 'group', data: g })),
        ...clientsWithoutGroup.map(c => ({ type: 'client', data: c }))
    ];

    const totalPages = Math.max(1, Math.ceil(combinedEntities.length / ITEMS_PER_PAGE));
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedEntities = combinedEntities.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

    const StatsCard = ({ title, value, icon: Icon, color }) => (
        <Card className="border-none shadow-sm h-full">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{formatCurrency(value)}</p>
                </div>
                <div className={`p-3 rounded-full ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
        </Card>
    );

    const statsByCategory = useMemo(() => {
        const visibleClientIds = new Set([
            ...clientsWithoutGroup.map(c => c.id),
            ...filteredGroups.flatMap(g => clients.filter(c => c.id_grupo_economico === g.id).map(c => c.id))
        ]);

        let totalAtivos = 0;
        const categories = {};
        
        rawClassifications.forEach(c => {
            categories[c.nome] = 0;
        });
        categories['Não Classificado'] = 0;

        const activeContracts = contracts.filter(c => 
            (c.status === 'ativo' || c.status === 'Ativo') && 
            visibleClientIds.has(c.id_cliente)
        );
        
        activeContracts.forEach(contract => {
            let val = contract.valor_mensal;
            if (typeof val === 'string') val = val.replace(',', '.');
            const numVal = parseFloat(val || 0);

            totalAtivos += numVal;

            const client = clients.find(c => c.id === contract.id_cliente);
            if (client) {
                let classId = client.id_classificacao_cliente;
                if (client.id_grupo_economico) {
                    const group = groups.find(g => g.id === client.id_grupo_economico);
                    if (group && group.id_classificacao_cliente) {
                        classId = group.id_classificacao_cliente;
                    }
                }

                if (classId && classifications[classId]) {
                    const className = classifications[classId];
                    if (categories[className] !== undefined) {
                        categories[className] += numVal;
                    } else {
                        categories[className] = numVal;
                    }
                } else {
                    categories['Não Classificado'] += numVal;
                }
            } else {
                categories['Não Classificado'] += numVal;
            }
        });

        return { totalAtivos, categories };
    }, [contracts, clients, groups, classifications, rawClassifications, clientsWithoutGroup, filteredGroups]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Carteira de Clientes</h1>
                        <div className="group relative flex items-center">
                            <Info className="w-5 h-5 text-slate-400 cursor-help hover:text-indigo-500 transition-colors" />
                            
                            {/* Tooltip Dinâmico */}
                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-[380px] bg-slate-800 text-white text-sm rounded-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl border border-slate-700">
                                <h4 className="font-semibold mb-3 text-slate-200 border-b border-slate-700 pb-2 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-indigo-400" />
                                    Regras de Classificação
                                </h4>
                                <ul className="space-y-2">
                                    {rawClassifications.map(c => (
                                        <li key={c.id} className="flex justify-between items-start gap-4">
                                            <span className="font-bold text-indigo-300 whitespace-nowrap">{c.nome}:</span>
                                            <span className="text-slate-300 text-right leading-tight">
                                                {c.tipo_categoria === 'quantidade' 
                                                    ? `${c.quantidade} Maiores faturamentos` 
                                                    : c.valor > 0 
                                                        ? `Faturamento acima de ${formatCurrency(c.valor)}` 
                                                        : `Faturamento abaixo dos demais`}
                                            </span>
                                        </li>
                                    ))}
                                    {rawClassifications.length === 0 && (
                                        <li className="text-slate-400 italic">Nenhuma regra cadastrada</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">Visão hierárquica de Grupos Econômicos e Empresas.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={Filter} onClick={() => setFilterModalOpen(true)}>Filtrar</Button>
                    <Button variant="outline" icon={Plus} onClick={handleNewGroup}>Novo Grupo</Button>
                    <Button onClick={() => navigate('/clientes/novo')} icon={Plus}>Novo Cliente</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatsCard 
                    title="Total de Contratos Ativos" 
                    value={statsByCategory.totalAtivos} 
                    icon={TrendingUp} 
                    color="bg-teal-500" 
                />
                {Object.entries(statsByCategory.categories).map(([name, value], i) => {
                    const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-rose-500', 'bg-orange-500'];
                    const color = name === 'Não Classificado' ? 'bg-slate-400' : colors[i % colors.length];
                    return (
                        <StatsCard 
                            key={name}
                            title={`Categoria: ${name}`}
                            value={value}
                            icon={DollarSign}
                            color={color}
                        />
                    );
                })}
            </div>

            <Card className="p-4 border-0 shadow-sm bg-white dark:bg-slate-900">
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
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3 w-12"></th>
                                <th className="px-6 py-3">Nome / Razão Social</th>
                                <th className="px-6 py-3">CNPJ / Info</th>
                                <th className="px-6 py-3">Classificação</th>
                                <th className="px-6 py-3">Valor Contratos</th>
                                <th className="px-6 py-3">Vendedor</th>
                                <th className="px-6 py-3">VP</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead >
                        <tbody className="divide-y divide-slate-100">
                            {paginatedEntities.map((entity, index) => {
                                if (entity.type === 'group') {
                                    const group = entity.data;
                                    return (
                                        <React.Fragment key={`g-${group.id}`}>
                                            <tr className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:bg-slate-800 cursor-pointer transition-colors" onClick={() => toggleGroup(group.id)}>
                                                <td className="px-6 py-3 text-center">
                                                    {expandedGroups.includes(group.id) ? <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
                                                </td>
                                                <td className="px-6 py-3 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                    <Building className="w-4 h-4 text-teal-600" />
                                                    {group.nome}
                                                </td>
                                                <td className="px-6 py-3 text-slate-500 dark:text-slate-400 italic">{group.descricao || 'Grupo Econômico'}</td>
                                                <td className="px-6 py-3">
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        {classifications[group.id_classificacao_cliente] || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-300">
                                                    {formatCurrency(calculateGroupTotal(group.id))}
                                                </td>
                                                <td className="px-6 py-3"></td>
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
                                                <tr key={client.id} className="hover:bg-white dark:bg-slate-900 bg-white dark:bg-slate-900 border-l-4 border-l-transparent hover:border-l-teal-500 transition-all">
                                                    <td className="px-6 py-3"></td>
                                                    <td className="px-6 py-3 pl-12 flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                                                        {client.nome_fantasia}
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{client.cpf_cnpj}</td>
                                                    <td className="px-6 py-3">
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                                            {classifications[client.id_classificacao_cliente] || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400 font-medium">
                                                        {formatCurrency(calculateContractTotal(client.id))}
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                                                        {sellers[client.id_usuario] || '-'}
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                                                        {sellers[client.vp] || '-'}
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
                                    );
                                } else {
                                    const client = entity.data;
                                    const showHeader = index === 0 || paginatedEntities[index - 1].type !== 'client';
                                    
                                    return (
                                        <React.Fragment key={`c-${client.id}`}>
                                            {showHeader && (
                                                <tr className="bg-slate-50 dark:bg-slate-800/50/80 border-t border-slate-200 dark:border-slate-700">
                                                    <td colSpan="9" className="px-6 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                        Clientes sem Grupo
                                                    </td>
                                                </tr>
                                            )}
                                            <tr className="hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-3"></td>
                                                <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100">{client.nome_fantasia}</td>
                                                <td className="px-6 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{client.cpf_cnpj}</td>
                                                <td className="px-6 py-3">
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                        {classifications[client.id_classificacao_cliente] || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-slate-600 dark:text-slate-400 font-medium">
                                                    {formatCurrency(calculateContractTotal(client.id))}
                                                </td>
                                                <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                                                    {sellers[client.id_usuario] || '-'}
                                                </td>
                                                <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                                                    {sellers[client.vp] || '-'}
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
                                        </React.Fragment>
                                    );
                                }
                            })}

                            {combinedEntities.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        Nenhum cliente ou grupo encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    
                    {combinedEntities.length > 0 && (
                        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-900">
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                Mostrando <span className="font-medium text-slate-900 dark:text-slate-100">{startIndex + 1}</span> a <span className="font-medium text-slate-900 dark:text-slate-100">{Math.min(startIndex + ITEMS_PER_PAGE, combinedEntities.length)}</span> de <span className="font-medium text-slate-900 dark:text-slate-100">{combinedEntities.length}</span> registros
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1 rounded text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                
                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const pageNum = i + 1;
                                    // Show first, last, current, and adjacent pages
                                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                                                    currentPage === pageNum 
                                                    ? 'bg-teal-600 text-white' 
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                        return <span key={pageNum} className="text-slate-400 px-1">...</span>;
                                    }
                                    return null;
                                })}

                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1 rounded text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
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
