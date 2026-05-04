import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import Api from '../../utils/api';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Skeleton from '../ui/Skeleton';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { UserFormModal } from './SettingsModals';

const SettingsUsers = () => {
    const api = new Api();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/usuarios');
            setUsers(res.usuarios || []);
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserType = (tipo) => {
        switch (tipo) {
            case 'admin':
                return 'Administrador';
            case 'user':
                return 'Usuário';
            case 'dev':
                return 'Desenvolvedor';
            default:
                return 'Usuário';
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEdit = (user) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleNew = () => {
        setEditingUser(null);
        setModalOpen(true);
    };

    const handleSuccess = () => {
        setModalOpen(false);
        fetchUsers();
    };

    const handleDelete = async (user) => {
        if (!confirm(`Confirmar exclusão do usuário ${user.nome}?`)) return;
        try {
            //await api.delete(`/usuarios/${user.id}`);
            fetchUsers();
        } catch (err) {
            console.error('Erro ao deletar usuário', err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Usuários</h2>
                    <p className="text-slate-500 text-sm">Gerencie o acesso ao sistema.</p>
                </div>
                <Button icon={Plus} size="sm" onClick={handleNew}>Novo Usuário</Button>
            </div>

            <Card className="p-4 border-0 shadow-sm bg-white">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Buscar por nome ou email..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3">Nome</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Tipo</th>
                                    <th className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.filter(u =>
                                    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    u.email.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                                        <td className="px-6 py-3 font-medium text-slate-900">{u.nome}</td>
                                        <td className="px-6 py-3 text-slate-500">{u.email}</td>
                                        <td className="px-6 py-3">
                                            <Badge status={fetchUserType(u.tipo)} />
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            {u.tipo !== 'dev' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="text-slate-400 hover:text-teal-600 transition-colors" title="Editar" onClick={() => handleEdit(u)}>
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-slate-400 hover:text-teal-600 transition-colors" title="Excluir" onClick={() => handleDelete(u)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                            Nenhum usuário encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {modalOpen && (
                <UserFormModal
                    user={editingUser}
                    onClose={() => setModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default SettingsUsers;
