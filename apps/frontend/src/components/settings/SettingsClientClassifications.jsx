import { useState, useEffect } from 'react';
import { Plus, Edit2, Archive, CheckCircle, Search } from 'lucide-react';
import Api from '../../utils/api';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Skeleton from '../ui/Skeleton';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { ClientClassificationFormModal } from './SettingsModals';

const SettingsClientClassifications = () => {
    const api = new Api();
    const [loading, setLoading] = useState(true);
    const [classifications, setClassifications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingClassification, setEditingClassification] = useState(null);

    const fetchClassifications = async () => {
        try {
            const res = await api.get('/classificacoes-clientes');
            setClassifications(res.classificacoes || []);
        } catch (error) {
            console.error("Error loading classifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClassifications();
    }, []);

    const handleEdit = (classification) => {
        setEditingClassification(classification);
        setModalOpen(true);
    };

    const handleNew = () => {
        setEditingClassification(null);
        setModalOpen(true);
    };

    const handleSuccess = () => {
        setModalOpen(false);
        fetchClassifications();
    };

    const toggleStatus = async (classification) => {
        if (window.confirm("Deseja alterar o status desta classificação?")) {
            try {
                const newStatus = classification.status === 'ativo' ? 'inativo' : 'ativo';
                await api.put(`/classificacoes-clientes/${classification.id}`, { status: newStatus });
                fetchClassifications();
            } catch (error) {
                console.error(error);
            }
        }
    };

    if (loading) return <Skeleton className="h-40 w-full" />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900">Classificações de Clientes</h2>
                <Button icon={Plus} size="sm" onClick={handleNew}>Nova Classificação</Button>
            </div>

            <Card className="p-4 border-0 shadow-sm bg-white mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Buscar por nome..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3">Nome</th>
                            <th className="px-6 py-3">Categoria</th>
                            <th className="px-6 py-3">Qtd/Valor</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {classifications.filter(c =>
                            c.nome.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map(c => (
                            <tr key={c.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                                <td className="px-6 py-3 font-medium text-slate-900">{c.nome}</td>
                                <td className="px-6 py-3 text-slate-500">
                                    {c.tipo_categoria === 'quantidade' ? 'Quantidade' : 'Valor'}
                                </td>
                                <td className="px-6 py-3 text-slate-500">
                                    {c.tipo_categoria === 'quantidade'
                                        ? c.quantidade
                                        : `R$ ${parseFloat(c.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                </td>
                                <td className="px-6 py-3">
                                    <Badge status={c.status === 'ativo' ? 'Ativo' : 'Inativo'} />
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleEdit(c)} className="text-slate-400 hover:text-teal-600 transition-colors" title="Editar">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => toggleStatus(c)} className="text-slate-400 hover:text-indigo-600 transition-colors" title="Alterar Status">
                                            {c.status === 'ativo' ? <Archive className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {classifications.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                    Nenhuma classificação encontrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <ClientClassificationFormModal
                    classification={editingClassification}
                    onClose={() => setModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default SettingsClientClassifications;
