import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from '../ui/Button';

const ClientFilterModal = ({ isOpen, onClose, onApply, filters, classifications, sellers }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        if (isOpen) {
            setLocalFilters(filters);
        }
    }, [isOpen, filters]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleClear = () => {
        const cleared = { status: 'ativo', classification: '', seller: '' };
        setLocalFilters(cleared);
        // We might want to apply immediately or let user click apply. 
        // Legacy behavior seems to be apply on button click.
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 top-0 left-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="font-semibold text-lg text-slate-800">Filtrar Clientes</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Status</label>
                        <select
                            name="status"
                            value={localFilters.status}
                            onChange={handleChange}
                            className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                            <option value="">Todos</option>
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Classificação</label>
                        <select
                            name="classification"
                            value={localFilters.classification}
                            onChange={handleChange}
                            className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                            <option value="">Todas</option>
                            {Object.entries(classifications).map(([id, name]) => (
                                <option key={id} value={id}>{name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Vendedor</label>
                        <select
                            name="seller"
                            value={localFilters.seller}
                            onChange={handleChange}
                            className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                            <option value="">Todos</option>
                            {Object.entries(sellers).map(([id, name]) => (
                                <option key={id} value={id}>{name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 p-4 bg-slate-50 border-t border-slate-100 justify-end">
                    <Button variant="ghost" onClick={handleClear}>Limpar</Button>
                    <Button onClick={handleApply}>Aplicar Filtros</Button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ClientFilterModal;
