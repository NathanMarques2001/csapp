import { DollarSign, FileText, Users, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';

const Stats = ({ clientes = [], contratos = [] }) => {
    // Calcular Receita Mensal (Recorrente)
    const receitaMensal = contratos
        .filter(c => c.status === 'Ativo')
        .reduce((acc, c) => {
            const valor = Number(c.valor) || 0;
            // Se for Anual, divide por 12 para mensalizar, senão usa valor cheio
            return acc + (c.tipoFaturamento === 'Anual' ? valor / 12 : valor);
        }, 0);

    // Contratos Ativos
    const contratosAtivos = contratos.filter(c => c.status === 'Ativo').length;

    // Clientes TOP 30 (Assumindo que essa info vem no cliente ou classificação)
    // Se não tiver campo exato no objeto cliente, usamos um placeholder ou lógica disponível
    // O mock tinha 'classificacao: "TOP 30"'. Vamos tentar usar isso.
    const clientesTop30 = clientes.filter(c => c.classificacao === 'TOP 30').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    {/* Placeholder trend logic */}
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-600">
                        +12%
                    </span>
                </div>
                <div>
                    <h4 className="text-slate-500 text-sm font-medium font-inter">Receita Mensal</h4>
                    <span className="text-2xl font-bold text-slate-900 font-montserrat tracking-tight">{formatCurrency(receitaMensal)}</span>
                </div>
            </Card>

            <Card className="flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                        <FileText className="w-6 h-6" />
                    </div>
                </div>
                <div>
                    <h4 className="text-slate-500 text-sm font-medium font-inter">Contratos Ativos</h4>
                    <span className="text-2xl font-bold text-slate-900 font-montserrat tracking-tight">{contratosAtivos}</span>
                </div>
            </Card>

            <Card className="flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
                <div>
                    <h4 className="text-slate-500 text-sm font-medium font-inter">Clientes Top 30</h4>
                    <span className="text-2xl font-bold text-slate-900 font-montserrat tracking-tight">{clientesTop30}</span>
                </div>
            </Card>

            <Card className="flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>
                <div>
                    <h4 className="text-slate-500 text-sm font-medium font-inter">Tickets Abertos</h4>
                    {/* Placeholder since we don't fetch tickets yet */}
                    <span className="text-2xl font-bold text-slate-900 font-montserrat tracking-tight">-</span>
                </div>
            </Card>
        </div>
    );
};
export default Stats;
