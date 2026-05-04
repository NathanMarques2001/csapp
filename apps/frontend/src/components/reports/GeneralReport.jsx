import { useState, useMemo } from 'react';
import { CSVLink } from 'react-csv';
import { Download, Search, Filter } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';

const GeneralReport = ({ contracts, clientsMap, productsMap, usersMap }) => {
    const [filters, setFilters] = useState({
        clientName: '',
        product: '',
        seller: '',
        contractStatus: '',
        clientStatus: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    // Prepare joined data
    const joinedData = useMemo(() => {
        return contracts.map(contract => {
            const client = clientsMap[contract.clienteId] || {};
            const product = productsMap[contract.produtoId] || {};
            const seller = usersMap[client.vendedorId] || {};

            return {
                id: contract.id,
                razaoSocial: client.razaoSocial || '-',
                nomeFantasia: client.nomeFantasia || '-',
                cnpj: client.cnpj || '-',
                solucao: product.nome || '-',
                valor: contract.valor || 0,
                vendedor: seller.nome || '-',
                statusCliente: client.status || '-',
                statusContrato: contract.status || '-',
                // Gestores (assuming they are in client.contatos or similar, but for now using placeholders if structure differs)
                gestorChamados: client.gestorChamados?.nome || '-',
                emailGestorChamados: client.gestorChamados?.email || '-',
                gestorFinanceiro: client.gestorFinanceiro?.nome || '-',
                // ... add other fields as needed matching legacy
            };
        });
    }, [contracts, clientsMap, productsMap, usersMap]);

    // Filter logic
    const filteredData = useMemo(() => {
        return joinedData.filter(item => {
            const matchClient = !filters.clientName ||
                item.nomeFantasia.toLowerCase().includes(filters.clientName.toLowerCase()) ||
                item.razaoSocial.toLowerCase().includes(filters.clientName.toLowerCase());

            const matchProduct = !filters.product || item.solucao === filters.product;
            const matchSeller = !filters.seller || item.vendedor === filters.seller;
            const matchContractStatus = !filters.contractStatus || item.statusContrato === filters.contractStatus;
            const matchClientStatus = !filters.clientStatus || item.statusCliente === filters.clientStatus;

            return matchClient && matchProduct && matchSeller && matchContractStatus && matchClientStatus;
        });
    }, [joinedData, filters]);

    // Unique values for select options
    const productsList = useMemo(() => [...new Set(joinedData.map(i => i.solucao))].sort(), [joinedData]);
    const sellersList = useMemo(() => [...new Set(joinedData.map(i => i.vendedor))].sort(), [joinedData]);

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            clientName: '',
            product: '',
            seller: '',
            contractStatus: '',
            clientStatus: ''
        });
    };

    // CSV Data
    const csvData = filteredData.map(item => ({
        "Razão Social": item.razaoSocial,
        "Nome Fantasia": item.nomeFantasia,
        "CNPJ": item.cnpj,
        "Solução": item.solucao,
        "Valor Contrato": item.valor,
        "Vendedor": item.vendedor,
        "Status Cliente": item.statusCliente,
        "Status Contrato": item.statusContrato,
        "Gestor Chamados": item.gestorChamados,
        "Email Gestor Chamados": item.emailGestorChamados,
        "Gestor Financeiro": item.gestorFinanceiro
    }));

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-lg border border-slate-200 gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar Cliente..."
                            value={filters.clientName}
                            onChange={(e) => handleFilterChange('clientName', e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button
                        variant="outline"
                        icon={Filter}
                        onClick={() => setShowFilters(!showFilters)}
                        className={showFilters ? 'bg-slate-100' : ''}
                    >
                        Filtros
                    </Button>
                </div>
                <div className="flex gap-2">
                    <CSVLink data={csvData} filename={"relatorio_geral.csv"} className="btn-export">
                        <Button variant="outline" icon={Download}>Exportar Excel</Button>
                    </CSVLink>
                </div>
            </div>

            {showFilters && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
                    <Select
                        label="Produto/Solução"
                        value={filters.product}
                        onChange={(e) => handleFilterChange('product', e.target.value)}
                        options={[
                            { value: '', label: 'Todos' },
                            ...productsList.map(p => ({ value: p, label: p }))
                        ]}
                    />
                    <Select
                        label="Vendedor"
                        value={filters.seller}
                        onChange={(e) => handleFilterChange('seller', e.target.value)}
                        options={[
                            { value: '', label: 'Todos' },
                            ...sellersList.map(s => ({ value: s, label: s }))
                        ]}
                    />
                    <Select
                        label="Status Contrato"
                        value={filters.contractStatus}
                        onChange={(e) => handleFilterChange('contractStatus', e.target.value)}
                        options={[
                            { value: '', label: 'Todos' },
                            { value: 'Ativo', label: 'Ativo' },
                            { value: 'Inativo', label: 'Inativo' },
                            { value: 'Pendente', label: 'Pendente' }
                        ]}
                    />
                    <Select
                        label="Status Cliente"
                        value={filters.clientStatus}
                        onChange={(e) => handleFilterChange('clientStatus', e.target.value)}
                        options={[
                            { value: '', label: 'Todos' },
                            { value: 'Ativo', label: 'Ativo' },
                            { value: 'Inativo', label: 'Inativo' },
                            { value: 'Lead', label: 'Lead' }
                        ]}
                    />
                    <div className="md:col-span-4 flex justify-end">
                        <Button variant="ghost" onClick={clearFilters} className="text-sm h-8">Limpar Filtros</Button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3">Nome Fantasia</th>
                                <th className="px-6 py-3">CNPJ</th>
                                <th className="px-6 py-3">Solução</th>
                                <th className="px-6 py-3">Valor</th>
                                <th className="px-6 py-3">Vendedor</th>
                                <th className="px-6 py-3">Status Cli.</th>
                                <th className="px-6 py-3">Status Cont.</th>
                                <th className="px-6 py-3">Gestor Chamados</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-900">{item.nomeFantasia}</td>
                                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">{item.cnpj}</td>
                                    <td className="px-6 py-3 text-slate-500">{item.solucao}</td>
                                    <td className="px-6 py-3 text-slate-700 font-medium">{formatCurrency(item.valor)}</td>
                                    <td className="px-6 py-3 text-slate-500">{item.vendedor}</td>
                                    <td className="px-6 py-3">
                                        <Badge variant={item.statusCliente === 'Ativo' ? 'success' : 'secondary'}>{item.statusCliente}</Badge>
                                    </td>
                                    <td className="px-6 py-3">
                                        <Badge variant={item.statusContrato === 'Ativo' ? 'success' : 'secondary'}>{item.statusContrato}</Badge>
                                    </td>
                                    <td className="px-6 py-3 text-slate-500">{item.gestorChamados}</td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500">
                    Mostrando {filteredData.length} registro(s)
                </div>
            </div>
        </div>
    );
};

export default GeneralReport;
