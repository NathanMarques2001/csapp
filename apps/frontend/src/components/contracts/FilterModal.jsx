import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // <--- 1. Importação necessária
import { X } from 'lucide-react';
import Button from '../ui/Button';

const FilterModal = ({ isOpen, onClose, onApply, initialFilters, clients, products }) => {
    const [filters, setFilters] = useState({
        razao_social: "",
        nome_fantasia: "",
        status: "",
        nome_produto: "",
    });

    useEffect(() => {
        if (initialFilters) {
            setFilters(prev => ({ ...prev, ...initialFilters }));
        }
    }, [initialFilters, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onApply(filters);
    };

    const handleClear = () => {
        const cleared = {
            razao_social: "",
            nome_fantasia: "",
            status: "",
            nome_produto: "",
        };
        setFilters(cleared);
    };

    if (!isOpen) return null;

    // 2. Isolamos o JSX do modal numa variável e aumentamos o z-index
    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-slate-900 mb-6">Filtrar Contratos</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700">Razão Social</label>
                        <select
                            name="razao_social"
                            value={filters.razao_social}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        >
                            <option value="">Selecione...</option>
                            {Object.values(clients).map((client) => (
                                <option key={client.id} value={client.razao_social}>
                                    {client.razao_social}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700">Nome Fantasia</label>
                        <select
                            name="nome_fantasia"
                            value={filters.nome_fantasia}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        >
                            <option value="">Selecione...</option>
                            {Object.values(clients).map((client) => (
                                <option key={client.id} value={client.nome_fantasia}>
                                    {client.nome_fantasia}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700">Status</label>
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        >
                            <option value="">Selecione...</option>
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700">Nome Produto</label>
                        <select
                            name="nome_produto"
                            value={filters.nome_produto}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        >
                            <option value="">Selecione...</option>
                            {Object.values(products).map((product) => (
                                <option key={product.id} value={product.nome}>
                                    {product.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleClear} className="flex-1">
                            Limpar
                        </Button>
                        <Button type="submit" className="flex-1">
                            Aplicar Filtros
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );

    // 3. Retornamos usando o Portal
    return createPortal(modalContent, document.body);
};

export default FilterModal;