import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Edit2, Plus, ChevronRight, FileText, CheckCircle, XCircle,
    Package, Factory, Building, Power
} from 'lucide-react';
import Api from '../utils/api';
import { formatCurrency, formatDate, formatCpfCnpj } from '../utils/formatters';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import ContactCard from '../components/ui/ContactCard';
import { GroupFormModal } from '../components/settings/SettingsModals';
import BackButton from '../components/ui/BackButton';
import { useConfirm } from '../context/ConfirmContext';
import { confirmPresets } from '../utils/confirmPresets';

const parseDate = (dateStr) => {
    if (!dateStr) return null;
    let data = new Date(dateStr);
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts[0].length === 4) {
            data = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
            data = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
    }
    return isNaN(data.getTime()) ? null : data;
};

const calcularProximoVencimento = (dataInicio, duracao) => {
    if (!dataInicio) return null;
    const duracaoMeses = parseInt(duracao);
    if (!duracaoMeses || duracaoMeses <= 0) return null;
    if (duracaoMeses === 12000) return 'Indeterminado';

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let data = parseDate(dataInicio);
    if (!data) return null;

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

const EconomicGroupDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const api = new Api();
    const { confirm } = useConfirm();
    const [activeTab, setActiveTab] = useState('overview');
    const [editModalOpen, setEditModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState(null);
    const [clients, setClients] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [products, setProducts] = useState({});
    const [manufacturers, setManufacturers] = useState({});
    const [classifications, setClassifications] = useState({});

    const clientsById = useMemo(
        () => clients.reduce((acc, c) => ({ ...acc, [c.id]: c }), {}),
        [clients]
    );

    const matrizClient = useMemo(
        () => clients.find(c => c.tipo_unidade === 'pai') || clients[0] || null,
        [clients]
    );

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [groupRes, clientsRes, contractsRes, productsRes, manufacturersRes, classificationsRes] = await Promise.all([
                api.get(`/grupos-economicos/${id}`),
                api.get(`/clientes/grupo-economico/${id}`),
                api.get('/contratos'),
                api.get('/produtos'),
                api.get('/fabricantes'),
                api.get('/classificacoes-clientes'),
            ]);

            const groupClients = clientsRes.clientes || [];
            const clientIds = new Set(groupClients.map(c => c.id));
            const groupContracts = (contractsRes.contratos || []).filter(c => clientIds.has(c.id_cliente));

            setGroup(groupRes.grupoEconomico);
            setClients(groupClients);
            setContracts(groupContracts);

            const prodMap = (productsRes.produtos || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
            setProducts(prodMap);

            const manufMap = (manufacturersRes.fabricantes || []).reduce((acc, m) => ({ ...acc, [m.id]: m.nome }), {});
            setManufacturers(manufMap);

            const classMap = (classificationsRes.classificacoes || []).reduce((acc, c) => ({ ...acc, [c.id]: c.nome }), {});
            setClassifications(classMap);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchData();
    }, [id, fetchData]);

    const handleToggleStatus = async () => {
        const newStatus = group.status === 'ativo' ? 'inativo' : 'ativo';
        const confirmed = await confirm(confirmPresets.deactivateGroup(newStatus === 'ativo'));
        if (!confirmed) return;

        try {
            await api.put(`/grupos-economicos/active-inactive/${id}`);
            await fetchData();
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Erro ao alterar status do grupo.');
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
            </div>
        );
    }

    if (!group) return <div>Grupo econômico não encontrado</div>;

    const activeContracts = contracts.filter(c => c.status === 'ativo');
    const inactiveContracts = contracts.filter(c => c.status === 'inativo');

    const totalARR = activeContracts.reduce((acc, c) => {
        const value = Number(c.valor_mensal || 0);
        return acc + (c.tipo_faturamento === 'mensal' ? value * 12 : value);
    }, 0);

    const totalMRR = activeContracts.reduce((acc, c) => {
        const value = Number(c.valor_mensal || 0);
        return acc + (c.tipo_faturamento === 'mensal' ? value : value / 12);
    }, 0);

    const nextReadjustment = activeContracts
        .map(c => ({ ...c, parsedReadjustment: parseDate(c.proximo_reajuste) }))
        .filter(c => c.parsedReadjustment && c.parsedReadjustment > new Date())
        .sort((a, b) => a.parsedReadjustment - b.parsedReadjustment)[0];

    const nextRenewal = activeContracts
        .map(c => ({
            ...c,
            vencimentoCalculado: calcularProximoVencimento(c.data_inicio, c.duracao),
        }))
        .filter(c => c.vencimentoCalculado instanceof Date && c.vencimentoCalculado > new Date())
        .sort((a, b) => a.vencimentoCalculado - b.vencimentoCalculado)[0];

    const recentContracts = [...contracts]
        .sort((a, b) => new Date(b.data_inicio || 0) - new Date(a.data_inicio || 0))
        .slice(0, 4);

    const calculateClientTotal = (clientId, type) =>
        contracts
            .filter(c => c.id_cliente === clientId && c.status === 'ativo' && c.tipo_faturamento?.toLowerCase() === type)
            .reduce((sum, c) => sum + Number(c.valor_mensal || 0), 0);

    const tabs = [
        { key: 'overview', label: 'Visão Geral' },
        { key: 'unidades', label: 'Unidades' },
        { key: 'contatos', label: 'Contatos' },
        { key: 'contratos', label: 'Contratos' },
        { key: 'histórico', label: 'Histórico' },
    ];

    const contactSource = matrizClient;

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <BackButton fallback="/clientes" />
                        <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700">
                            <Building className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{group.nome}</h1>
                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1 flex-wrap">
                                <span>Grupo Econômico</span>
                                <span className="w-1 h-1 bg-slate-400 rounded-full" />
                                <span>{clients.length} {clients.length === 1 ? 'unidade' : 'unidades'}</span>
                                {group.id_classificacao_cliente && (
                                    <>
                                        <span className="w-1 h-1 bg-slate-400 rounded-full" />
                                        <span>{classifications[group.id_classificacao_cliente] || '-'}</span>
                                    </>
                                )}
                                <Badge status={group.status || 'ativo'} />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" icon={Edit2} onClick={() => setEditModalOpen(true)}>
                            Editar Grupo
                        </Button>
                        <Button icon={Plus} onClick={() => navigate('/contratos/novo')}>
                            Novo Contrato
                        </Button>
                    </div>
                </div>

                <div className="flex gap-6 mt-8 border-b border-slate-200 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
                                activeTab === tab.key
                                    ? 'text-teal-600 border-b-2 border-teal-600'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'overview' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Receita Anual Recorrente (ARR)</h3>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalARR)}</p>
                        </Card>
                        <Card className="p-6">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Contratos Ativos</h3>
                            <p className="text-2xl font-bold text-slate-900">{activeContracts.length}</p>
                        </Card>
                        <Card className="p-6">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Próxima Renovação</h3>
                            <div className="flex flex-col">
                                <p className="text-2xl font-bold text-slate-900">
                                    {nextRenewal ? (
                                        <>
                                            <span className="text-lg font-normal text-slate-400">#{nextRenewal.id} - </span>
                                            {formatDate(nextRenewal.vencimentoCalculado)}
                                        </>
                                    ) : '-'}
                                </p>
                                {nextRenewal && (
                                    <p className="text-sm text-amber-600 mt-1">
                                        Faltam {Math.ceil((nextRenewal.vencimentoCalculado - new Date()) / (1000 * 60 * 60 * 24))} dias
                                    </p>
                                )}
                            </div>
                        </Card>
                        <Card className="p-6">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Receita Mensal Recorrente (MRR)</h3>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalMRR)}</p>
                        </Card>
                        <Card className="p-6">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Contratos Inativos</h3>
                            <p className="text-2xl font-bold text-slate-900">{inactiveContracts.length}</p>
                        </Card>
                        <Card className="p-6">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Próximo Reajuste</h3>
                            <div className="flex flex-col">
                                <p className="text-2xl font-bold text-slate-900">
                                    {nextReadjustment ? (
                                        <>
                                            <span className="text-lg font-normal text-slate-400">#{nextReadjustment.id} - </span>
                                            {formatDate(nextReadjustment.parsedReadjustment)}
                                        </>
                                    ) : '-'}
                                </p>
                                {nextReadjustment && (
                                    <p className="text-sm text-slate-500 mt-1">
                                        Faltam {Math.ceil((nextReadjustment.parsedReadjustment - new Date()) / (1000 * 60 * 60 * 24))} dias
                                    </p>
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6">
                            <h3 className="font-bold mb-4 text-slate-900">
                                Principais Contatos
                                {matrizClient && (
                                    <span className="text-sm font-normal text-slate-500 ml-2">
                                        ({matrizClient.nome_fantasia})
                                    </span>
                                )}
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { role: 'Gestor de Contratos', name: contactSource?.gestor_contratos_nome, email: contactSource?.gestor_contratos_email },
                                    { role: 'Gestor Financeiro', name: contactSource?.gestor_financeiro_nome, email: contactSource?.gestor_financeiro_email },
                                ]
                                    .filter(c => c.name)
                                    .map((contact, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
                                            onClick={() => setActiveTab('contatos')}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700">
                                                    {contact.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{contact.name}</p>
                                                    <p className="text-xs text-slate-500">{contact.role}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                        </div>
                                    ))}
                                {!contactSource?.gestor_contratos_nome && !contactSource?.gestor_financeiro_nome && (
                                    <p className="text-slate-500 text-sm">Nenhum contato cadastrado na matriz.</p>
                                )}
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="font-bold mb-4 text-slate-900">Últimos Contratos</h3>
                            <div className="space-y-3">
                                {recentContracts.map(c => (
                                    <div
                                        key={c.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/contratos/${c.id}/editar`)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">
                                                    Contrato #{c.id} - {products[c.id_produto]?.nome || `Produto ${c.id_produto}`}
                                                </p>
                                                <p className="text-xs text-slate-500 capitalize">
                                                    {clientsById[c.id_cliente]?.nome_fantasia || 'Unidade'} · {formatCurrency(c.valor_mensal)} - {c.tipo_faturamento}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge status={c.status} />
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                ))}
                                {contracts.length === 0 && (
                                    <p className="text-sm text-slate-500">Nenhum contrato encontrado.</p>
                                )}
                            </div>
                        </Card>
                    </div>

                    <Card className="p-6">
                        <h3 className="font-bold mb-4 text-slate-900">Unidades do Grupo</h3>
                        <div className="space-y-3">
                            {clients.map(client => (
                                <div
                                    key={client.id}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/clientes/${client.id}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold">
                                            {(client.nome_fantasia || 'CL').substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{client.nome_fantasia}</p>
                                            <p className="text-xs text-slate-500">
                                                {formatCpfCnpj(client.cpf_cnpj)}
                                                {client.tipo_unidade && ` · ${client.tipo_unidade === 'pai' ? 'Matriz' : 'Filial'}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge status={client.status} />
                                        <ChevronRight className="w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                            ))}
                            {clients.length === 0 && (
                                <p className="text-sm text-slate-500">Nenhuma unidade vinculada a este grupo.</p>
                            )}
                        </div>
                    </Card>
                </>
            )}

            {activeTab === 'unidades' && (
                <div className="space-y-6">
                    {clients.map(client => {
                        const clientContracts = contracts.filter(c => c.id_cliente === client.id);
                        const monthlyTotal = calculateClientTotal(client.id, 'mensal');
                        const annualTotal = calculateClientTotal(client.id, 'anual');

                        return (
                            <Card key={client.id} className="overflow-hidden border-slate-200">
                                <div
                                    className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => navigate(`/clientes/${client.id}`)}
                                >
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-lg text-slate-800">{client.nome_fantasia}</h3>
                                            <Badge status={client.status} size="sm" />
                                            {client.tipo_unidade && (
                                                <span className="text-xs font-medium text-slate-600 bg-slate-200 px-2 py-0.5 rounded capitalize">
                                                    {client.tipo_unidade === 'pai' ? 'Matriz' : 'Filial'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-500 text-sm">{formatCpfCnpj(client.cpf_cnpj)}</p>
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

                                <div className="overflow-x-auto">
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
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-4 text-center text-slate-400 italic">
                                                        Nenhum contrato encontrado
                                                    </td>
                                                </tr>
                                            ) : (
                                                clientContracts.map(contract => {
                                                    const product = products[contract.id_produto];
                                                    const manufacturerName = product ? manufacturers[product.id_fabricante] : '-';

                                                    return (
                                                        <tr
                                                            key={contract.id}
                                                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                                                            onClick={() => navigate(`/contratos/${contract.id}/editar`)}
                                                        >
                                                            <td className="px-6 py-4">
                                                                {contract.status === 'ativo' ? (
                                                                    <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                                                                        <CheckCircle size={16} /> Ativo
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                                                                        <XCircle size={16} /> Inativo
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                                <div className="flex items-center gap-2">
                                                                    <Package size={16} className="text-indigo-400" />
                                                                    {product?.nome || contract.id_produto}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-500">
                                                                {formatDate(contract.data_inicio)}
                                                            </td>
                                                            <td className="px-6 py-4 font-mono text-slate-600">
                                                                {formatCurrency(contract.valor_mensal)}
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-600">
                                                                {contract.duracao === 12000 ? 'Indeterminado' : `${contract.duracao} Meses`}
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-500">
                                                                <div className="flex items-center gap-2">
                                                                    <Factory size={16} className="text-slate-400" />
                                                                    {manufacturerName}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
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
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        );
                    })}
                    {clients.length === 0 && (
                        <Card className="p-8 text-center text-slate-500">
                            Nenhuma unidade vinculada a este grupo.
                        </Card>
                    )}
                </div>
            )}

            {activeTab === 'contatos' && contactSource && (
                <div className="space-y-8">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1">Gestores Principais</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Contatos da unidade matriz: <span className="font-medium">{contactSource.nome_fantasia}</span>
                        </p>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ContactCard
                                title="Gestor de Contratos"
                                name={contactSource.gestor_contratos_nome}
                                email={contactSource.gestor_contratos_email}
                                phone={contactSource.gestor_contratos_telefone_1}
                            />
                            <ContactCard
                                title="Gestor Financeiro"
                                name={contactSource.gestor_financeiro_nome}
                                email={contactSource.gestor_financeiro_email}
                                phone={contactSource.gestor_financeiro_telefone_1}
                            />
                            <ContactCard
                                title="Gestor de Chamados"
                                name={contactSource.gestor_chamados_nome}
                                email={contactSource.gestor_chamados_email}
                                phone={contactSource.gestor_chamados_telefone_1}
                            />
                        </div>
                    </div>

                    {clients.filter(c => c.id !== contactSource.id).length > 0 && (
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 mb-4">Outras Unidades</h3>
                            <div className="space-y-2">
                                {clients
                                    .filter(c => c.id !== contactSource.id)
                                    .map(client => (
                                        <div
                                            key={client.id}
                                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
                                            onClick={() => navigate(`/clientes/${client.id}`)}
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{client.nome_fantasia}</p>
                                                <p className="text-xs text-slate-500">
                                                    Ver contatos na página da unidade
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'contatos' && !contactSource && (
                <Card className="p-8 text-center text-slate-500">
                    Nenhuma unidade vinculada para exibir contatos.
                </Card>
            )}

            {activeTab === 'contratos' && (
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-end gap-6 text-sm">
                        <div className="text-right">
                            <p className="text-slate-500 uppercase tracking-wider text-xs mb-1">Faturamento Mensal</p>
                            <p className="font-bold text-slate-700 text-lg">
                                {formatCurrency(
                                    contracts
                                        .filter(c => c.status === 'ativo' && c.tipo_faturamento === 'mensal')
                                        .reduce((acc, c) => acc + Number(c.valor_mensal || 0), 0)
                                )}
                            </p>
                        </div>
                        <div className="text-right pl-6 border-l border-slate-200">
                            <p className="text-slate-500 uppercase tracking-wider text-xs mb-1">Faturamento Anual</p>
                            <p className="font-bold text-slate-700 text-lg">
                                {formatCurrency(
                                    contracts
                                        .filter(c => c.status === 'ativo' && c.tipo_faturamento === 'anual')
                                        .reduce((acc, c) => acc + Number(c.valor_mensal || 0), 0)
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Unidade</th>
                                    <th className="px-6 py-3">Solução</th>
                                    <th className="px-6 py-3">Contratação</th>
                                    <th className="px-6 py-3">Valor</th>
                                    <th className="px-6 py-3">Recorrência</th>
                                    <th className="px-6 py-3">Fabricante</th>
                                    <th className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {contracts.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-8 text-center text-slate-400 italic">
                                            Nenhum contrato encontrado
                                        </td>
                                    </tr>
                                ) : (
                                    contracts.map(contract => {
                                        const product = products[contract.id_produto];
                                        const manufacturerName = product ? manufacturers[product.id_fabricante] : '-';
                                        const client = clientsById[contract.id_cliente];

                                        return (
                                            <tr
                                                key={contract.id}
                                                className="hover:bg-slate-50 transition-colors cursor-pointer"
                                                onClick={() => navigate(`/contratos/${contract.id}/editar`)}
                                            >
                                                <td className="px-6 py-4">
                                                    {contract.status === 'ativo' ? (
                                                        <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                                                            <CheckCircle size={16} /> Ativo
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                                                            <XCircle size={16} /> Inativo
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {client?.nome_fantasia || '-'}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-700">
                                                    <div className="flex items-center gap-2">
                                                        <Package size={16} className="text-indigo-400" />
                                                        {product?.nome || contract.id_produto}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    {formatDate(contract.data_inicio)}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-slate-600">
                                                    {formatCurrency(contract.valor_mensal)}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {contract.duracao === 12000 ? 'Indeterminado' : `${contract.duracao} Meses`}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    <div className="flex items-center gap-2">
                                                        <Factory size={16} className="text-slate-400" />
                                                        {manufacturerName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
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
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'histórico' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-900">Fatos Relevantes</h3>
                        <Button variant="outline" size="sm" icon={Plus}>Novo Fato</Button>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex gap-4">
                            <div className="mt-1">
                                <div className="w-2 h-2 rounded-full bg-slate-300 mt-2" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">Grupo econômico cadastrado no sistema</p>
                                <p className="text-xs text-slate-500 mt-1">Registro inicial</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-8 text-center text-slate-500 border border-dashed border-slate-300">
                        Nenhum outro registro de histórico encontrado.
                    </div>
                </div>
            )}

            <div className="mt-12 pt-6 border-t border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Zona de Perigo</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <p className="font-medium text-red-900">
                            {group.status === 'ativo' ? 'Inativar Grupo Econômico' : 'Ativar Grupo Econômico'}
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                            {group.status === 'ativo'
                                ? 'Ao inativar o grupo, todos os clientes e contratos ativos das unidades serão automaticamente suspensos.'
                                : 'Ao ativar o grupo, apenas o status do grupo será alterado. Clientes e contratos permanecem como estão.'}
                        </p>
                    </div>
                    <Button
                        className={group.status === 'ativo'
                            ? 'bg-red-600 text-white hover:bg-red-700 border-transparent shadow-sm'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 border-transparent shadow-sm'}
                        icon={Power}
                        onClick={handleToggleStatus}
                    >
                        {group.status === 'ativo' ? 'Inativar Grupo' : 'Ativar Grupo'}
                    </Button>
                </div>
            </div>

            {editModalOpen && (
                <GroupFormModal
                    group={group}
                    onClose={() => setEditModalOpen(false)}
                    onSuccess={() => {
                        setEditModalOpen(false);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
};

export default EconomicGroupDetails;
