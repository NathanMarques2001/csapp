import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, ChevronRight, Building2, Users, FileText,
    RefreshCw, BarChart3, Package, Bell, Activity, AlertTriangle
} from 'lucide-react';
import Api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Stats from '../components/dashboard/Stats';
import Skeleton from '../components/ui/Skeleton';
import {
    getUpcomingRenewals,
    getUpcomingReadjustments,
    getRecentContracts,
    getContractCreatedAt,
    getRevenueByProduct,
    getClientsByClassification,
    getDaysUntil,
    urgencyLabel,
    computeMRR,
} from '../utils/dashboardMetrics';

const Dashboard = () => {
    const navigate = useNavigate();
    const [contratos, setContratos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [classifications, setClassifications] = useState([]);
    const [groups, setGroups] = useState([]);
    const [logs, setLogs] = useState([]);
    const [notificacoes, setNotificacoes] = useState([]);
    const [errosReajuste, setErrosReajuste] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const api = new Api();
                const [contratosRes, clientesRes, produtosRes, classificationsRes, groupsRes, logsRes, notifRes] = await Promise.all([
                    api.get('/contratos'),
                    api.get('/clientes'),
                    api.get('/produtos'),
                    api.get('/classificacoes-clientes'),
                    api.get('/grupos-economicos'),
                    api.get('/logs').catch(() => ({ logs: [] })),
                    api.get('/notificacoes/ativas').catch(() => ({ notificacoes: [] }))
                ]);

                // Optionally fetch erros de reajuste se o endpoint existir. Se não, pegamos vazio.
                let errosRes = { erros: [] };
                try {
                    errosRes = await api.get('/reajusta-contratos/erros');
                } catch (e) {
                    // Ignora se não existir
                }

                setContratos(contratosRes.contratos || []);
                setClientes(clientesRes.clientes || []);
                setProdutos(produtosRes.produtos || []);
                setClassifications(classificationsRes.classificacoes || []);
                setGroups(groupsRes.grupoEconomico || []);
                setLogs((logsRes.logs || logsRes || []).slice(0, 10)); // Top 10 recentes
                setNotificacoes(notifRes.notificacoes || notifRes || []);
                setErrosReajuste(errosRes.erros || []);
            } catch (error) {
                console.error('Erro ao carregar dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const clientsById = useMemo(
        () => clientes.reduce((acc, c) => ({ ...acc, [c.id]: c }), {}),
        [clientes]
    );

    const productsById = useMemo(
        () => produtos.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}),
        [produtos]
    );

    const upcomingRenewals = useMemo(() => getUpcomingRenewals(contratos, 90), [contratos]);
    const upcomingReadjustments = useMemo(() => getUpcomingReadjustments(contratos, 60), [contratos]);
    const recentContracts = useMemo(() => getRecentContracts(contratos, 5), [contratos]);
    const revenueByProduct = useMemo(() => getRevenueByProduct(contratos, produtos), [contratos, produtos]);
    const clientsByClass = useMemo(
        () => getClientsByClassification(clientes, classifications),
        [clientes, classifications]
    );

    const maxProductMrr = revenueByProduct[0]?.mrr || 1;
    const maxClassCount = clientsByClass[0]?.count || 1;

    const activeClients = clientes.filter(c => c.status === 'ativo').length;
    const inactiveClients = clientes.filter(c => c.status === 'inativo').length;
    const activeGroups = groups.filter(g => g.status === 'ativo').length;

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Painel de Controle</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Visão geral da operação de segurança e faturamento.
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => navigate('/clientes')}>
                        Clientes
                    </Button>
                    <Button size="sm" onClick={() => navigate('/contratos')}>
                        Contratos
                    </Button>
                </div>
            </div>

            <Stats clientes={clientes} contratos={contratos} classifications={classifications} />

            {/* Resumo operacional */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Clientes ativos', value: activeClients, icon: Users, color: 'text-teal-600 bg-teal-50' },
                    { label: 'Clientes inativos', value: inactiveClients, icon: Users, color: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800' },
                    { label: 'Grupos econômicos', value: groups.length, icon: Building2, color: 'text-indigo-600 bg-indigo-50' },
                    { label: 'Grupos ativos', value: activeGroups, icon: Building2, color: 'text-emerald-600 bg-emerald-50' },
                ].map(item => (
                    <div
                        key={item.label}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex items-center gap-3 shadow-sm"
                    >
                        <div className={`p-2 rounded-lg ${item.color}`}>
                            <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Alerta de Erros de Reajuste */}
            {errosReajuste.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-semibold text-red-800">
                            Atenção: Falha no reajuste automático de {errosReajuste.length} contrato(s)
                        </h3>
                        <p className="text-xs text-red-600 mt-1">
                            Alguns contratos não puderam ser reajustados devido à ausência de índice no sistema para o mês atual.
                            Por favor, verifique o módulo de Reajustes.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Notificações Pendentes */}
                <Card
                    title="Notificações Pendentes"
                    className="lg:col-span-2 border-l-4 border-l-rose-400"
                    action={
                        <Button variant="ghost" className="text-xs" onClick={() => navigate('/relatorios')}>
                            Ver todas
                        </Button>
                    }
                >
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                        <Bell className="w-4 h-4" />
                        Aguardando confirmação
                    </div>
                    {notificacoes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <Bell className="w-8 h-8 mb-2 opacity-40" />
                            <p className="text-sm text-center">Nenhuma notificação pendente.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {notificacoes.slice(0, 5).map(n => {
                                const contrato = contratos.find(c => c.id === n.id_contrato);
                                const cliente = clientes.find(c => c.id === contrato?.id_cliente);
                                return (
                                    <div
                                        key={n.id}
                                        className="flex flex-col p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-rose-50/40 cursor-pointer text-sm transition-colors border border-slate-100 dark:border-slate-700/50"
                                        onClick={() => navigate(`/contratos/${n.id_contrato}/editar`)}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium text-slate-900 dark:text-slate-100">{cliente?.nome_fantasia || 'Cliente Desconhecido'}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(n.created_at || n.createdAt)}</span>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{n.descricao}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="secondary">{n.modulo}</Badge>
                                            <span className="text-xs text-slate-400">Contrato #{n.id_contrato}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>

                {/* Feed de Atividades Recentes */}
                <Card
                    title="Atividades Recentes"
                    className="lg:col-span-1"
                >
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                        <Activity className="w-4 h-4" />
                        Ações no sistema
                    </div>
                    {logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <Activity className="w-8 h-8 mb-2 opacity-40" />
                            <p className="text-sm text-center">Nenhum log recente.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-56 overflow-y-auto pr-2 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                            {logs.map((log, index) => (
                                <div key={log.id || index} className="relative flex items-start gap-4">
                                    <div className="absolute left-0 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-4 border-teal-100 dark:border-teal-900/50 flex items-center justify-center -translate-x-0.5 mt-1.5 z-10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                                    </div>
                                    <div className="ml-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700/50 relative shadow-sm w-full">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{log.nome_usuario}</span>
                                            <span className="text-[10px] text-slate-400">{formatDate(log.created_at || log.createdAt)}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2" title={log.alteracao}>
                                            {log.alteracao}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Últimos contratos */}
                <Card
                    title="Últimos Contratos Cadastrados"
                    action={
                        <Button variant="ghost" className="text-xs" onClick={() => navigate('/contratos')}>
                            Ver todos
                        </Button>
                    }
                >
                    <div className="space-y-1">
                        {recentContracts.map(c => {
                            const cliente = clientsById[c.id_cliente];
                            const produto = productsById[c.id_produto];
                            return (
                                <div
                                    key={c.id}
                                    className="flex justify-between items-center py-3 px-2 -mx-2 rounded-lg hover:bg-slate-50 dark:bg-slate-800/50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                                    onClick={() => navigate(`/contratos/${c.id}/editar`)}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                            <FileText className="w-4 h-4 text-indigo-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">
                                                {cliente?.nome_fantasia || `Cliente #${c.id_cliente}`}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                #{c.id} · {produto?.nome || 'Produto'}
                                                {getContractCreatedAt(c) && (
                                                    <> · Cadastro {formatDate(getContractCreatedAt(c))}</>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-3">
                                        <p className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {formatCurrency(c.valor_mensal)}
                                        </p>
                                        <Badge status={c.status} />
                                    </div>
                                </div>
                            );
                        })}
                        {recentContracts.length === 0 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">Nenhum contrato encontrado.</p>
                        )}
                    </div>
                </Card>

                {/* Renovações pendentes */}
                <Card
                    title="Renovações Pendentes"
                    className="border-l-4 border-l-amber-400"
                    action={
                        <span className="text-xs text-amber-600 font-medium">Próximos 90 dias</span>
                    }
                >
                    {upcomingRenewals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                            <Calendar className="w-10 h-10 mb-2 opacity-50" />
                            <p className="text-sm">Nenhuma renovação nos próximos 90 dias.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 h-[380px] overflow-y-auto pr-1">
                            {upcomingRenewals.map(c => {
                                const cliente = clientsById[c.id_cliente];
                                const days = getDaysUntil(c.vencimento);
                                const urgency = urgencyLabel(days);
                                return (
                                    <div
                                        key={c.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-50/50 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/contratos/${c.id}/editar`)}
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                                {cliente?.nome_fantasia || `Cliente #${c.id_cliente}`}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Contrato #{c.id} · {formatDate(c.vencimento)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${urgency.className}`}>
                                                {days}d
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Receita por produto */}
                <Card title="Receita por Produto (MRR)" className="lg:col-span-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                        <Package className="w-4 h-4" />
                        Top 5 soluções por receita recorrente
                    </div>
                    {revenueByProduct.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">Sem dados de faturamento.</p>
                    ) : (
                        <div className="space-y-4">
                            {revenueByProduct.map((item, idx) => (
                                <div key={item.id}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate pr-2">
                                            <span className="text-slate-400 mr-1">#{idx + 1}</span>
                                            {item.nome}
                                        </span>
                                        <span className="font-mono text-slate-600 dark:text-slate-400 shrink-0">
                                            {formatCurrency(item.mrr)}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full transition-all duration-500"
                                            style={{ width: `${(item.mrr / maxProductMrr) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Clientes por classificação */}
                <Card title="Clientes por Classificação" className="lg:col-span-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                        <BarChart3 className="w-4 h-4" />
                        Distribuição de clientes ativos
                    </div>
                    {clientsByClass.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">Nenhum cliente classificado.</p>
                    ) : (
                        <div className="space-y-3">
                            {clientsByClass.map(item => (
                                <div key={item.id}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-700 dark:text-slate-300 truncate pr-2">{item.nome}</span>
                                        <span className="font-semibold text-slate-900 dark:text-slate-100 shrink-0">{item.count}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500 rounded-full"
                                            style={{ width: `${(item.count / maxClassCount) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Reajustes próximos */}
                <Card
                    title="Reajustes Próximos"
                    className="lg:col-span-1 border-l-4 border-l-indigo-400"
                >
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                        <RefreshCw className="w-4 h-4" />
                        Próximos 60 dias
                    </div>
                    {upcomingReadjustments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <RefreshCw className="w-8 h-8 mb-2 opacity-40" />
                            <p className="text-sm text-center">Nenhum reajuste programado.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto">
                            {upcomingReadjustments.slice(0, 6).map(c => {
                                const cliente = clientsById[c.id_cliente];
                                const days = getDaysUntil(c.parsedReajuste);
                                const urgency = urgencyLabel(days);
                                return (
                                    <div
                                        key={c.id}
                                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/40 cursor-pointer text-sm"
                                        onClick={() => navigate(`/contratos/${c.id}/editar`)}
                                    >
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                                {cliente?.nome_fantasia || `#${c.id_cliente}`}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(c.parsedReajuste)}</p>
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${urgency.className}`}>
                                            {days}d
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>

            {/* MRR total footer strip */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="text-slate-400 text-sm uppercase tracking-wider">Receita recorrente consolidada</p>
                        <p className="text-3xl font-bold text-teal-400 mt-1">
                            {formatCurrency(computeMRR(contratos))}
                            <span className="text-lg font-normal text-slate-400 ml-2">/ mês</span>
                        </p>
                    </div>
                    <div className="flex gap-6 text-sm">
                        <div className="text-center">
                            <p className="text-slate-400">Contratos ativos</p>
                            <p className="text-xl font-bold">{contratos.filter(c => c.status === 'ativo').length}</p>
                        </div>
                        <div className="text-center border-l border-slate-600 pl-6">
                            <p className="text-slate-400">Renovações (90d)</p>
                            <p className="text-xl font-bold text-amber-400">{upcomingRenewals.length}</p>
                        </div>
                        <div className="text-center border-l border-slate-600 pl-6">
                            <p className="text-slate-400">Reajustes (60d)</p>
                            <p className="text-xl font-bold text-indigo-300">{upcomingReadjustments.length}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
