import { useState } from 'react';
import { CSVLink } from 'react-csv';
import { Download, Search } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

const ContractReport = ({ contracts, clientsMap, productsMap, usersMap }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter logic
    const filteredContracts = contracts.filter(c => {
        const clientName = clientsMap[c.clienteId]?.nomeFantasia || '';
        return clientName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // CSV Data preparation
    const csvData = filteredContracts.map(c => ({
        id: c.id,
        cliente: clientsMap[c.clienteId]?.nomeFantasia || 'N/A',
        produto: productsMap[c.produtoId]?.nome || 'N/A',
        valor: c.valor,
        inicio: formatDate(c.inicio),
        fim: formatDate(c.fim),
        status: c.status
    }));

    // Totals
    const totalValor = filteredContracts.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Filtrar por cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    <CSVLink data={csvData} filename={"relatorio_contratos.csv"} className="btn-export">
                        <Button variant="outline" icon={Download}>Exportar CSV</Button>
                    </CSVLink>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Produto</th>
                                <th className="px-6 py-3 text-right">Valor</th>
                                <th className="px-6 py-3">Início</th>
                                <th className="px-6 py-3">Fim</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredContracts.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-mono text-slate-500">#{c.id}</td>
                                    <td className="px-6 py-3 font-medium text-slate-900">{clientsMap[c.clienteId]?.nomeFantasia || '-'}</td>
                                    <td className="px-6 py-3 text-slate-500">{productsMap[c.produtoId]?.nome || '-'}</td>
                                    <td className="px-6 py-3 text-right font-medium text-slate-700">{formatCurrency(c.valor)}</td>
                                    <td className="px-6 py-3 text-slate-500">{formatDate(c.inicio)}</td>
                                    <td className="px-6 py-3 text-slate-500">{formatDate(c.fim)}</td>
                                    <td className="px-6 py-3">
                                        <Badge variant={c.status === 'Ativo' ? 'success' : 'secondary'}>{c.status}</Badge>
                                    </td>
                                </tr>
                            ))}
                            {filteredContracts.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold text-slate-900">
                            <tr>
                                <td colSpan="3" className="px-6 py-3 text-right">Total:</td>
                                <td className="px-6 py-3 text-right">{formatCurrency(totalValor)}</td>
                                <td colSpan="3"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ContractReport;
