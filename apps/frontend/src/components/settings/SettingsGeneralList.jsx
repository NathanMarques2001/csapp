import { useState, useEffect } from 'react';
import { Plus, Edit2, Archive, CheckCircle, Search } from 'lucide-react';
import Input from '../ui/Input';
import Card from '../ui/Card';
import Api from '../../utils/api';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Skeleton from '../ui/Skeleton';
import { GenericFormModal } from './SettingsModals';

const SettingsGeneralList = ({ title, endpoint, dataKey, columns = [{ key: 'nome', label: 'Nome' }] }) => {
    const api = new Api();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            const res = await api.get(endpoint);
            setItems(res[dataKey] || []);
        } catch (error) {
            console.error(`Error loading ${dataKey}:`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [endpoint, dataKey]);

    const handleEdit = (item) => {
        setEditingItem(item);
        setModalOpen(true);
    };

    const handleNew = () => {
        setEditingItem(null);
        setModalOpen(true);
    };

    const handleSuccess = () => {
        setModalOpen(false);
        fetchData();
    };

    const toggleStatus = async (item) => {
        if (window.confirm("Deseja alterar o status?")) {
            try {
                const newStatus = item.status === 'inativo' ? 'ativo' : 'inativo';
                await api.put(`${endpoint}/${item.id}`, { status: newStatus });
                fetchData();
            } catch (error) {
                console.error(error);
            }
        }
    };

    if (loading) return <Skeleton className="h-40 w-full" />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                <Button icon={Plus} size="sm" onClick={handleNew}>Novo Item</Button>
            </div>

            <Card className="p-4 border-0 shadow-sm bg-white mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Buscar..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} className="px-6 py-3">{col.label}</th>
                        ))}
                        <th className="px-6 py-3 text-center">Status</th>
                        <th className="px-6 py-3 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {items.filter(item =>
                        columns.some(col =>
                            String(item[col.key] || '').toLowerCase().includes(searchTerm.toLowerCase())
                        )
                    ).map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                            {columns.map(col => (
                                <td key={col.key} className="px-6 py-3 font-medium text-slate-900">{item[col.key]}</td>
                            ))}
                            <td className="px-6 py-3 text-center">
                                <Badge status={item.status === 'inativo' ? 'inativo' : 'ativo'} />
                            </td>
                            <td className="px-6 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-teal-600 transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => toggleStatus(item)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                                        {item.status === 'inativo' ? <CheckCircle className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={columns.length + 2} className="px-6 py-8 text-center text-slate-400">
                                Nenhum item encontrado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {modalOpen && (
                <GenericFormModal
                    title={title}
                    endpoint={endpoint}
                    item={editingItem}
                    onClose={() => setModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default SettingsGeneralList;
