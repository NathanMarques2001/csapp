import { useState, useMemo } from 'react';
import { Download, Search, Filter, X } from 'lucide-react';
import { exportToExcel } from '../../utils/excel';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';

const ProductReport = ({ products, manufacturersMap }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        nome: '',
        fabricante: '',
        status: '',
    });

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
        setFilters({
            nome: '',
            fabricante: '',
            status: '',
        });
        setSearchTerm('');
    };

    const filteredProducts = useMemo(() => {
        return products.filter((produto) => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                (produto.nome || '').toLowerCase().includes(searchLower) ||
                (manufacturersMap[produto.id_fabricante]?.nome || '').toLowerCase().includes(searchLower);

            const matchesNome = !filters.nome || (produto.nome || '') === filters.nome;
            const matchesFabricante = !filters.fabricante || (manufacturersMap[produto.id_fabricante]?.nome || '') === filters.fabricante;
            const matchesStatus = !filters.status || (produto.status || '').toLowerCase() === filters.status.toLowerCase();

            return matchesSearch && matchesNome && matchesFabricante && matchesStatus;
        });
    }, [products, filters, searchTerm, manufacturersMap]);

    const csvData = useMemo(() => {
        return filteredProducts.map((produto) => ({
            "Nome": produto.nome || "Desconhecido",
            "Fabricante": manufacturersMap[produto.id_fabricante]?.nome || "Desconhecido",
            "Status": produto.status || "Desconhecido",
        }));
    }, [filteredProducts, manufacturersMap]);

    const handleExport = () => {
        exportToExcel(csvData, "relatorio_produtos");
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-lg border border-slate-200 gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar produto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full"
                    />
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Button variant="outline" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
                        Filtros
                    </Button>
                    <Button variant="primary" icon={Download} onClick={handleExport}>
                        Exportar Excel
                    </Button>
                </div>
            </div>

            {showFilters && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Produto</label>
                        <select name="nome" value={filters.nome} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                            <option value="">Todos</option>
                            {products.map(p => (
                                <option key={p.id} value={p.nome}>{p.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Fabricante</label>
                        <select name="fabricante" value={filters.fabricante} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                            <option value="">Todos</option>
                            {Object.values(manufacturersMap || {}).map(f => (
                                <option key={f.id} value={f.nome}>{f.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white py-2 px-3">
                            <option value="">Todos</option>
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                        </select>
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                        <Button variant="ghost" icon={X} onClick={clearFilters} className="text-slate-500">Limpar Filtros</Button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden relative">
                <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Nome do Produto</th>
                                <th className="px-6 py-3">Fabricante</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-900">{p.nome || '-'}</td>
                                    <td className="px-6 py-3 text-slate-500">{manufacturersMap[p.id_fabricante]?.nome || '-'}</td>
                                    <td className="px-6 py-3">
                                        <Badge status={p.status} />
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500">
                    Mostrando {filteredProducts.length} registro(s)
                </div>
            </div>
        </div>
    );
};

export default ProductReport;
