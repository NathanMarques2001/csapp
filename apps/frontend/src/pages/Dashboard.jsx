import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import Api from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Stats from '../components/dashboard/Stats';
import Skeleton from '../components/ui/Skeleton';

const Dashboard = () => {
    const [contratos, setContratos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const api = new Api();
                // Fetch basic data for dashboard
                // We utilize Promise.all to fetch concurrently
                const [contratosRes, clientesRes, produtosRes] = await Promise.all([
                    api.get('/contratos'),
                    api.get('/clientes'),
                    api.get('/produtos')
                ]);

                // Handle response structures based on known backend format ({ key: [...] })
                setContratos(contratosRes.contratos || []);
                setClientes(clientesRes.clientes || []);
                setProdutos(produtosRes.produtos || []);
            } catch (error) {
                console.error("Erro ao carregar dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
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
            <div>
                <h1 className="text-2xl font-bold font-montserrat text-slate-900">Painel de Controle</h1>
                <p className="text-slate-500 text-sm">Visão geral da operação de segurança e faturamento.</p>
            </div>
            {/* Pass fetched data to Stats if it accepts props, otherwise Stats might need update too. 
                Assuming Stats is self-contained or I need to check it. 
                For now preserving <Stats /> but if it uses mocks it needs fix. 
                I will check Stats content next.
            */}
            <Stats clientes={clientes} contratos={contratos} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Últimos Contratos" action={<Button variant="ghost" className="text-xs">Ver todos</Button>}>
                    <div className="space-y-4">
                        {contratos.slice(0, 3).map(c => {
                            const cliente = clientes.find(cl => cl.id === c.clienteId);
                            const produto = produtos.find(p => p.id === c.produtoId);
                            return (
                                <div key={c.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                    <div>
                                        <p className="font-medium text-slate-900 text-sm">{cliente?.nomeFantasia || 'Cliente Desconhecido'}</p>
                                        <p className="text-xs text-slate-500">{produto?.nome || 'Produto Indisponível'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-sm font-medium text-slate-700">{formatCurrency(c.valor)}</p>
                                        <Badge status={c.status} />
                                    </div>
                                </div>
                            )
                        })}
                        {contratos.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Nenhum contrato encontrado.</p>}
                    </div>
                </Card>
                <Card title="Renovações Pendentes" className="border-l-4 border-l-amber-400">
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                        <Calendar className="w-10 h-10 mb-2 opacity-50" />
                        <p>Nenhuma renovação crítica para esta semana.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};
export default Dashboard;
