import { useState, useEffect, useMemo } from 'react';
import { Download, FileText, BarChart, Users, Box, ClipboardList, Activity } from 'lucide-react';
import Api from '../utils/api';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import ClientReport from '../components/reports/ClientReport';
import ContractReport from '../components/reports/ContractReport';
import ProductReport from '../components/reports/ProductReport';
import GeneralReport from '../components/reports/GeneralReport';
import BirthdayReport from '../components/reports/BirthdayReport';
import HistoryReport from '../components/reports/HistoryReport';
import NotificationReport from '../components/reports/NotificationReport';
import LogsReport from '../components/reports/LogsReport';

const Reports = () => {
    const api = new Api();
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);

    // Data State
    const [data, setData] = useState({
        clients: [],
        contracts: [],
        products: [],
        users: [],
        segments: [],
        groups: [],
        manufacturers: [],
        categories: [],
        clientClassifications: []
    });
    const [generatingReport, setGeneratingReport] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [
                    clientsRes, contractsRes, productsRes, usersRes,
                    segmentsRes, groupsRes, manuRes, catsRes, classRes
                ] = await Promise.all([
                    api.get("/clientes"),
                    api.get("/contratos"),
                    api.get("/produtos"),
                    api.get("/usuarios"),
                    api.get("/segmentos"),
                    api.get("/grupos-economicos"),
                    api.get("/fabricantes"),
                    api.get("/categorias-produtos"),
                    api.get("/classificacoes-clientes")
                ]);

                setData({
                    clients: clientsRes.clientes || [],
                    contracts: contractsRes.contratos || [],
                    products: productsRes.produtos || [],
                    users: usersRes.usuarios || [],
                    segments: segmentsRes.segmentos || [],
                    groups: groupsRes.grupoEconomico || [],
                    manufacturers: manuRes.fabricantes || [],
                    categories: catsRes.categorias || [],
                    clientClassifications: classRes.classificacoes || []
                });
            } catch (error) {
                console.error("Error loading report data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    // Maps for easy lookup
    const maps = useMemo(() => ({
        users: data.users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {}),
        segments: data.segments.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}),
        groups: data.groups.reduce((acc, g) => ({ ...acc, [g.id]: g }), {}),
        clients: data.clients.reduce((acc, c) => ({ ...acc, [c.id]: c }), {}),
        products: data.products.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}),
        manufacturers: data.manufacturers.reduce((acc, m) => ({ ...acc, [m.id]: m }), {}),
        categories: data.categories.reduce((acc, c) => ({ ...acc, [c.id]: c }), {}),
        clientClassifications: data.clientClassifications.reduce((acc, c) => ({ ...acc, [c.id]: c }), {}),
    }), [data]);

    const reportTypes = [
        { id: 'clients', title: 'Relatório de Clientes', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100', component: ClientReport },
        { id: 'contracts', title: 'Relatório de Contratos', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100', component: ContractReport },
        { id: 'products', title: 'Relatório de Produtos', icon: Box, color: 'text-emerald-600', bg: 'bg-emerald-100', component: ProductReport },
        { id: 'general', title: 'Relatório Geral', icon: BarChart, color: 'text-blue-600', bg: 'bg-blue-100', component: GeneralReport },
        { id: 'birthdays', title: 'Aniversariantes', icon: Users, color: 'text-pink-600', bg: 'bg-pink-100', component: BirthdayReport },
        { id: 'history', title: 'Histórico', icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-100', component: HistoryReport },
        { id: 'notifications', title: 'Notificações', icon: Activity, color: 'text-red-600', bg: 'bg-red-100', component: NotificationReport },
        { id: 'logs', title: 'Logs do Sistema', icon: Activity, color: 'text-slate-600', bg: 'bg-slate-100', component: LogsReport },
    ];

    const handleSelectReport = (id) => {
        setGeneratingReport(id);
        setTimeout(() => {
            setSelectedReport(id);
            setGeneratingReport(null);
        }, 50); // delay curto para permitir que a UI do "Carregando" renderize
    };

    const renderSelectedReport = () => {
        if (!selectedReport) return null;

        const ReportComponent = reportTypes.find(r => r.id === selectedReport)?.component;
        if (!ReportComponent) return null;

        return (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900">{reportTypes.find(r => r.id === selectedReport)?.title}</h2>
                    <button onClick={() => setSelectedReport(null)} className="text-sm text-slate-500 hover:text-red-500">Fechar Relatório</button>
                </div>
                <ReportComponent
                    clients={data.clients}
                    contracts={data.contracts}
                    products={data.products}
                    usersMap={maps.users}
                    segmentsMap={maps.segments}
                    groupsMap={maps.groups}
                    clientsMap={maps.clients}
                    productsMap={maps.products}
                    manufacturersMap={maps.manufacturers}
                    categoriesMap={maps.categories}
                    clientClassificationsMap={maps.clientClassifications}
                />
            </div>
        );
    };

    if (loading) return <div className="space-y-4"><Skeleton className="h-12 w-full" /><div className="grid grid-cols-4 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Relatórios Gerenciais</h1>
                <p className="text-slate-500">Acompanhe a performance da carteira, contratos e cadastros em tempo real.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {reportTypes.map((rep) => (
                    <Card
                        key={rep.id}
                        className={`p-4 cursor-pointer hover:border-teal-500 transition-all border-l-4 hover:shadow-md group relative overflow-hidden ${selectedReport === rep.id ? 'border-teal-500 ring-2 ring-teal-100' : 'border-l-transparent'}`}
                        onClick={() => handleSelectReport(rep.id)}
                    >
                        {generatingReport === rep.id && (
                            <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mb-1"></div>
                                <span className="text-xs font-medium text-teal-700">Gerando...</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${rep.bg}`}>
                                <rep.icon className={`w-5 h-5 ${rep.color}`} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">{rep.title}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Visualizar</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {selectedReport ? renderSelectedReport() : (
                <Card className="p-12 flex flex-col items-center justify-center min-h-[300px] text-center bg-slate-50/50 border-dashed border-2 border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <ClipboardList className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">Selecione um relatório</h3>
                    <p className="text-slate-400 max-w-sm text-sm">
                        Clique em um dos cards acima para carregar o relatório detalhado e as opções de exportação.
                    </p>
                </Card>
            )}
        </div>
    );
};

export default Reports;
