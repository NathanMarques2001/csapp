import { DollarSign, FileText, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import {
    computeMRR,
    computeARR,
    countTop30Clients,
    countCriticalAlerts,
} from '../../utils/dashboardMetrics';

const Stats = ({ clientes = [], contratos = [], classifications = [] }) => {
    const mrr = computeMRR(contratos);
    const arr = computeARR(contratos);
    const contratosAtivos = contratos.filter(c => c.status === 'ativo').length;
    const clientesTop30 = countTop30Clients(clientes, classifications);
    const alertas = countCriticalAlerts(contratos);
    const clientesAtivos = clientes.filter(c => c.status === 'ativo').length;

    const stats = [
        {
            label: 'Receita Mensal (MRR)',
            value: formatCurrency(mrr),
            sub: `ARR: ${formatCurrency(arr)}`,
            icon: DollarSign,
            iconBg: 'bg-emerald-50 text-emerald-600',
        },
        {
            label: 'Contratos Ativos',
            value: contratosAtivos,
            sub: `${contratos.length} no total`,
            icon: FileText,
            iconBg: 'bg-indigo-50 text-indigo-600',
        },
        {
            label: 'Clientes Top 30',
            value: clientesTop30,
            sub: `${clientesAtivos} clientes ativos`,
            icon: Users,
            iconBg: 'bg-purple-50 text-purple-600',
        },
        {
            label: 'Alertas (30 dias)',
            value: alertas,
            sub: 'Renovações + reajustes',
            icon: AlertTriangle,
            iconBg: alertas > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400',
            highlight: alertas > 0,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        {stat.label === 'Receita Mensal (MRR)' && (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                ativo
                            </span>
                        )}
                        {stat.highlight && (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                Ação
                            </span>
                        )}
                    </div>
                    <div>
                        <h4 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</h4>
                        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight block mt-1">
                            {stat.value}
                        </span>
                        <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default Stats;
