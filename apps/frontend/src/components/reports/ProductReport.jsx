import { useState } from 'react';
import { CSVLink } from 'react-csv';
import { Download, Search } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';

const ProductReport = ({ products, manufacturersMap, categoriesMap }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter logic
    const filteredProducts = products.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // CSV Data preparation
    const csvData = filteredProducts.map(p => ({
        id: p.id,
        nome: p.nome,
        fabricante: manufacturersMap[p.fabricanteId]?.nome || p.fabricante_nome || '-',
        categoria: categoriesMap[p.categoriaId]?.nome || p.categoria_nome || '-',
        status: p.status
    }));

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Filtrar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    <CSVLink data={csvData} filename={"relatorio_produtos.csv"} className="btn-export">
                        <Button variant="outline" icon={Download}>Exportar CSV</Button>
                    </CSVLink>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3">Nome</th>
                                <th className="px-6 py-3">Fabricante</th>
                                <th className="px-6 py-3">Categoria</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-900">{p.nome}</td>
                                    <td className="px-6 py-3 text-slate-500">{manufacturersMap[p.fabricanteId]?.nome || p.fabricante_nome || '-'}</td>
                                    <td className="px-6 py-3 text-slate-500">{categoriesMap[p.categoriaId]?.nome || p.categoria_nome || '-'}</td>
                                    <td className="px-6 py-3">
                                        <Badge variant={p.status === 'Inativo' ? 'secondary' : 'success'}>{p.status || 'Ativo'}</Badge>
                                    </td>
                                </tr>
                            ))}
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
