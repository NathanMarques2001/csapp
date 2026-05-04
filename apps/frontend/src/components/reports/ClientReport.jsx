import { useState } from 'react';
import { CSVLink } from 'react-csv';
import { Download, Search } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';

const ClientReport = ({ clients, contracts, usersMap, segmentsMap, groupsMap }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter logic
    const filteredClients = clients.filter(c =>
        c.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cnpj.includes(searchTerm)
    );

    // CSV Data preparation
    const csvData = filteredClients.map(c => ({
        id: c.id,
        razaoSocial: c.razaoSocial,
        nomeFantasia: c.nomeFantasia,
        cnpj: c.cnpj,
        segmento: segmentsMap[c.segmentoId]?.nome || c.segmento || '-',
        grupoEconomico: groupsMap[c.grupoId]?.nome || '-',
        vendedor: usersMap[c.vendedorId]?.nome || '-',
        status: c.status
    }));

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Filtrar clientes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    <CSVLink data={csvData} filename={"relatorio_clientes.csv"} className="btn-export">
                        <Button variant="outline" icon={Download}>Exportar CSV</Button>
                    </CSVLink>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3">Razão Social</th>
                                <th className="px-6 py-3">Nome Fantasia</th>
                                <th className="px-6 py-3">CNPJ</th>
                                <th className="px-6 py-3">Segmento</th>
                                <th className="px-6 py-3">Grupo Econômico</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredClients.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-900">{c.razaoSocial}</td>
                                    <td className="px-6 py-3 text-slate-500">{c.nomeFantasia}</td>
                                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">{c.cnpj}</td>
                                    <td className="px-6 py-3 text-slate-500">{segmentsMap[c.segmentoId]?.nome || c.segmento || '-'}</td>
                                    <td className="px-6 py-3 text-slate-500">{groupsMap[c.grupoId]?.nome || '-'}</td>
                                    <td className="px-6 py-3">
                                        <Badge variant={c.status === 'Ativo' ? 'success' : 'secondary'}>{c.status}</Badge>
                                    </td>
                                </tr>
                            ))}
                            {filteredClients.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500">
                    Mostrando {filteredClients.length} registro(s)
                </div>
            </div>
        </div>
    );
};

export default ClientReport;
