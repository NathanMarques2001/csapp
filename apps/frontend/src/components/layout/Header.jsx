import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { 
    Menu, ChevronRight, Bell, BellOff, Check, CheckCheck, 
    AlertTriangle, AlertCircle, Info, Calendar, Loader2 
} from 'lucide-react';
import Api from '../../utils/api';
import { formatDate } from '../../utils/formatters';
import { useConfirm } from '../../context/ConfirmContext';

const Header = ({ sidebarOpen, setSidebarOpen, selectedItem }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [cookies] = useCookies(['nomeUsuario', 'tipo', 'id']);
    const dropdownRef = useRef(null);
    const { confirm } = useConfirm();

    const nome = cookies.nomeUsuario || 'Usuário';
    const tipo = cookies.tipo || 'User';

    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'archived'
    const [loading, setLoading] = useState(false);

    // Fetch and enrich notifications
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const api = new Api();
            const [vencimentosRes, contratosRes, clientesRes] = await Promise.all([
                api.get('/vencimento-contratos'),
                api.get('/contratos'),
                api.get('/clientes')
            ]);

            const vencimentos = vencimentosRes.vencimentos || [];
            const contratos = contratosRes.contratos || [];
            const clientes = clientesRes.clientes || [];

            const contractsMap = contratos.reduce((acc, c) => ({ ...acc, [c.id]: c }), {});
            const clientsMap = clientes.reduce((acc, c) => ({ ...acc, [c.id]: c }), {});

            const enriched = vencimentos.map(v => {
                const contrato = contractsMap[v.id_contrato];
                const cliente = contrato ? clientsMap[contrato.id_cliente] : null;

                const date = new Date(v.data_vencimento);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                date.setHours(0, 0, 0, 0);

                const diffTime = date - today;
                const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                return {
                    id: v.id,
                    id_contrato: v.id_contrato,
                    data_vencimento: v.data_vencimento,
                    status: v.status,
                    cliente_nome: cliente?.nome_fantasia || `Cliente #${contrato?.id_cliente || ''}`,
                    id_usuario: cliente?.id_usuario || null, // Owner of this client
                    dias_restantes: daysLeft,
                };
            });

            // Filter notifications so that if they are NOT admin, they only see their own customer alerts
            const isUserAdmin = cookies.tipo && cookies.tipo.toLowerCase() === 'admin';
            const userId = cookies.id ? Number(cookies.id) : null;
            
            const filtered = enriched.filter(n => {
                if (isUserAdmin) return true;
                return n.id_usuario === userId;
            }).sort((a, b) => {
                // Active first, then sort by days remaining
                if (a.status !== b.status) {
                    return a.status === 'ativo' ? -1 : 1;
                }
                return a.dias_restantes - b.dias_restantes;
            });

            setNotifications(filtered);
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        } finally {
            setLoading(false);
        }
    }, [cookies.id, cookies.tipo]);

    // Load on mount and re-fetch when opening the dropdown panel
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Handle dropdown click-outside closure
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Toggle notification status (Active <-> Archived)
    const handleToggleStatus = async (id, newStatus, rawDate) => {
        try {
            const api = new Api();
            await api.put(`/vencimento-contratos/${id}`, { 
                status: newStatus,
                data_vencimento: rawDate
            });

            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, status: newStatus } : n)
            );
        } catch (error) {
            console.error(`Erro ao atualizar notificação ${id}:`, error);
        }
    };

    // Bulk action: Mark all as read (archive all active ones)
    const handleMarkAllAsRead = async () => {
        const activeNotifications = notifications.filter(n => n.status === 'ativo');
        if (activeNotifications.length === 0) return;

        const confirmed = await confirm({
            title: 'Concluir Todas as Notificações',
            message: 'Tem certeza que deseja concluir todas as notificações ativas? Essa ação é irreversível.',
            confirmLabel: 'Concluir Todas',
            cancelLabel: 'Cancelar',
            variant: 'danger'
        });
        if (!confirmed) return;

        try {
            const api = new Api();
            await Promise.all(
                activeNotifications.map(n => 
                    api.put(`/vencimento-contratos/${n.id}`, { 
                        status: 'inativo',
                        data_vencimento: n.data_vencimento
                    })
                )
            );

            setNotifications(prev =>
                prev.map(n => n.status === 'ativo' ? { ...n, status: 'inativo' } : n)
            );
        } catch (error) {
            console.error("Erro ao arquivar todas as notificações:", error);
        }
    };

    const handleNavigateToContract = (id_contrato) => {
        setIsOpen(false);
        navigate(`/contratos/${id_contrato}/editar`);
    };

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Map type to friendly label
    const getTipoLabel = (t) => {
        const map = {
            'admin': 'Administrador',
            'user': 'Usuário',
            'dev': 'Desenvolvedor'
        };
        return map[t.toLowerCase()] || t;
    };

    // Derive title from path
    const getPageTitle = (pathname) => {
        if (pathname.includes('/dashboard')) return 'Dashboard';
        if (pathname.includes('/clientes')) return 'Clientes';
        if (pathname.includes('/contratos')) return 'Contratos';
        if (pathname.includes('/solucoes')) return 'Soluções';
        if (pathname.includes('/relatorios')) return 'Relatórios';
        if (pathname.includes('/gestao')) return 'Gestão';
        return 'CSApp';
    };

    const activePage = getPageTitle(location.pathname);

    // Filtered lists and counts
    const activeCount = notifications.filter(n => n.status === 'ativo').length;
    const archivedCount = notifications.filter(n => n.status === 'inativo').length;

    const displayedNotifications = notifications.filter(n => 
        activeTab === 'active' ? n.status === 'ativo' : n.status === 'inativo'
    );

    const getUrgencyStyle = (days, status) => {
        if (status === 'inativo') {
            return {
                icon: Info,
                iconContainer: 'bg-slate-100 text-slate-400',
                badge: 'bg-slate-100 text-slate-500'
            };
        }
        if (days < 0) {
            return {
                icon: AlertTriangle,
                iconContainer: 'bg-rose-50 text-rose-600',
                badge: 'bg-rose-100 text-rose-700'
            };
        }
        if (days === 0) {
            return {
                icon: AlertTriangle,
                iconContainer: 'bg-rose-50 text-rose-600',
                badge: 'bg-rose-100 text-rose-700'
            };
        }
        if (days <= 30) {
            return {
                icon: AlertCircle,
                iconContainer: 'bg-amber-50 text-amber-600',
                badge: 'bg-amber-100 text-amber-700'
            };
        }
        return {
            icon: Info,
            iconContainer: 'bg-teal-50 text-teal-600',
            badge: 'bg-teal-50 text-teal-700'
        };
    };

    const getUrgencyText = (days) => {
        if (days < 0) {
            return `Venceu há ${Math.abs(days)}d`;
        }
        if (days === 0) {
            return 'Vence hoje!';
        }
        return `Vence em ${days}d`;
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-md text-slate-600">
                    <Menu className="w-5 h-5" />
                </button>
                {/* Breadcrumbs Mock */}
                <div className="hidden md:flex items-center text-sm text-slate-500">
                    <span className="capitalize">{activePage}</span>
                    {selectedItem && (
                        <>
                            <ChevronRight className="w-4 h-4 mx-1" />
                            <span className="text-slate-900 font-medium">Detalhes</span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notification Dropdown Container */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => {
                            setIsOpen(!isOpen);
                            if (!isOpen) fetchNotifications(); // Refresh on open
                        }} 
                        className={`relative p-2 rounded-full transition-all ${
                            isOpen ? 'bg-slate-100 text-teal-600' : 'text-slate-400 hover:text-teal-600 hover:bg-slate-50'
                        }`}
                    >
                        <Bell className="w-5 h-5" />
                        {activeCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
                        )}
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Header */}
                            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Central de Notificações</h4>
                                    <p className="text-slate-400 text-[10px]">Avisos operacionais e alertas</p>
                                </div>
                                {activeCount > 0 && (
                                    <button 
                                        onClick={handleMarkAllAsRead} 
                                        className="text-[11px] text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1.5 shadow-sm transition-all duration-200"
                                    >
                                        <CheckCheck className="w-3.5 h-3.5 text-teal-500" />
                                        Lidas
                                    </button>
                                )}
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-slate-100 bg-white">
                                <button
                                    onClick={() => setActiveTab('active')}
                                    className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-all relative ${
                                        activeTab === 'active' 
                                            ? 'border-teal-500 text-teal-600' 
                                            : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    Ativas
                                    {activeCount > 0 && (
                                        <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-teal-100 text-teal-700 rounded-full">
                                            {activeCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('archived')}
                                    className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-all relative ${
                                        activeTab === 'archived' 
                                            ? 'border-teal-500 text-teal-600' 
                                            : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    Arquivadas
                                    {archivedCount > 0 && (
                                        <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-600 rounded-full">
                                            {archivedCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Body Content */}
                            <div className="max-h-80 overflow-y-auto bg-white divide-y divide-slate-100">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                        <Loader2 className="w-6 h-6 animate-spin text-teal-500 mb-2" />
                                        <p className="text-xs">Carregando avisos...</p>
                                    </div>
                                ) : displayedNotifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3 border border-slate-100">
                                            <BellOff className="w-5 h-5" />
                                        </div>
                                        <h5 className="font-bold text-slate-700 text-xs">Nenhum aviso encontrado</h5>
                                        <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                                            {activeTab === 'active' 
                                                ? 'Não há vencimentos ativos para monitorar no momento. Bom trabalho!'
                                                : 'A lista de notificações arquivadas está vazia.'}
                                        </p>
                                    </div>
                                ) : (
                                    displayedNotifications.map(notif => {
                                        const urgency = getUrgencyStyle(notif.dias_restantes, notif.status);
                                        const Icon = urgency.icon;
                                        return (
                                            <div
                                                key={notif.id}
                                                className={`flex items-start gap-3 p-3.5 hover:bg-slate-50/50 transition-all relative ${
                                                    notif.status === 'ativo' ? 'bg-teal-50/5' : 'opacity-70'
                                                }`}
                                            >
                                                <div className={`p-2 rounded-full mt-0.5 shrink-0 ${urgency.iconContainer}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-slate-800 text-xs">
                                                            {notif.status === 'ativo' ? 'Vencimento de Contrato' : 'Aviso Arquivado'}
                                                        </span>
                                                        {notif.status === 'ativo' && notif.dias_restantes <= 0 && (
                                                            <span className="flex h-1.5 w-1.5 relative">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-600 text-xs leading-relaxed mt-0.5">
                                                        O contrato #{notif.id_contrato} da empresa <strong>{notif.cliente_nome}</strong> expira em {formatDate(notif.data_vencimento)}.
                                                    </p>

                                                    <div className="flex items-center justify-between gap-2 mt-3.5">
                                                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${urgency.badge}`}>
                                                            {getUrgencyText(notif.dias_restantes)}
                                                        </span>

                                                        <div className="flex gap-1.5">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleNavigateToContract(notif.id_contrato);
                                                                }}
                                                                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md transition-all hover:bg-slate-50 shadow-sm"
                                                            >
                                                                Ver Contrato
                                                            </button>

                                                            {notif.status === 'ativo' ? (
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        const confirmed = await confirm({
                                                                            title: 'Concluir Notificação',
                                                                            message: 'Tem certeza que deseja concluir essa notificação? Essa ação é irreversível.',
                                                                            confirmLabel: 'Concluir',
                                                                            cancelLabel: 'Cancelar',
                                                                            variant: 'danger'
                                                                        });
                                                                        if (confirmed) {
                                                                            handleToggleStatus(notif.id, 'inativo', notif.data_vencimento);
                                                                        }
                                                                    }}
                                                                    className="px-2.5 py-1 text-[11px] font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-all shadow-sm flex items-center gap-1"
                                                                >
                                                                    <Check className="w-3 h-3 text-white" />
                                                                    Concluir
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleToggleStatus(notif.id, 'ativo', notif.data_vencimento);
                                                                    }}
                                                                    className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 rounded-md transition-all"
                                                                >
                                                                    Reativar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-slate-200 mx-1"></div>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-full pr-3 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {getInitials(nome)}
                    </div>
                    <div className="hidden md:block text-sm">
                        <p className="font-medium text-slate-900 leading-none">{nome}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{getTipoLabel(tipo)}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
