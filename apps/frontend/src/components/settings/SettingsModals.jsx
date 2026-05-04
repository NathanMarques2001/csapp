import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Api from '../../utils/api';
import Button from '../ui/Button';

const ModalBase = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">{title}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                </button>
            </div>
            {children}
        </div>
    </div>
);

export const UserFormModal = ({ user, onClose, onSuccess }) => {
    const api = new Api();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: user?.nome || '',
        email: user?.email || '',
        tipo: user?.tipo || 'usuario',
        senha: '',
        confirmarSenha: ''
    });

    const isEditing = !!user;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isEditing && formData.senha !== formData.confirmarSenha) {
            alert("Senhas não conferem");
            return;
        }

        setLoading(true);
        try {
            const payload = { ...formData };
            if (isEditing) {
                delete payload.senha;
                delete payload.confirmarSenha;
                await api.put(`/usuarios/${user.id}`, payload);
            } else {
                await api.post('/usuarios', payload);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar usuário");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalBase title={isEditing ? 'Editar Usuário' : 'Novo Usuário'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.nome}
                        onChange={e => setFormData({ ...formData, nome: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                        type="email"
                        required
                        disabled={isEditing}
                        className="w-full px-3 py-2 border rounded-md disabled:bg-slate-50"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                    <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.tipo}
                        onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                    >
                        <option value="usuario">Usuário</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
                {!isEditing && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                            <input
                                type="password"
                                required
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.senha}
                                onChange={e => setFormData({ ...formData, senha: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Senha</label>
                            <input
                                type="password"
                                required
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.confirmarSenha}
                                onChange={e => setFormData({ ...formData, confirmarSenha: e.target.value })}
                            />
                        </div>
                    </>
                )}
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" loading={loading}>Salvar</Button>
                </div>
            </form>
        </ModalBase>
    );
};

export const ProductFormModal = ({ product, onClose, onSuccess }) => {
    const api = new Api();
    const [loading, setLoading] = useState(false);
    const [manufacturers, setManufacturers] = useState([]);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        nome: product?.nome || '',
        id_fabricante: product?.id_fabricante || '',
        id_categoria_produto: product?.id_categoria_produto || ''
    });

    useEffect(() => {
        const loadData = async () => {
            const [mRes, cRes] = await Promise.all([
                api.get('/fabricantes'),
                api.get('/categorias-produtos')
            ]);
            setManufacturers(mRes.fabricantes || []);
            setCategories(cRes.categorias || []);
        };
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (product) {
                await api.put(`/produtos/${product.id}`, formData);
            } else {
                await api.post('/produtos', formData);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar produto");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalBase title={product ? 'Editar Produto' : 'Novo Produto'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.nome}
                        onChange={e => setFormData({ ...formData, nome: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fabricante</label>
                    <select
                        required
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.id_fabricante}
                        onChange={e => setFormData({ ...formData, id_fabricante: e.target.value })}
                    >
                        <option value="">Selecione...</option>
                        {manufacturers.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                    <select
                        required
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.id_categoria_produto}
                        onChange={e => setFormData({ ...formData, id_categoria_produto: e.target.value })}
                    >
                        <option value="">Selecione...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" loading={loading}>Salvar</Button>
                </div>
            </form>
        </ModalBase>
    );
};

export const GenericFormModal = ({ title, endpoint, item, onClose, onSuccess }) => {
    const api = new Api();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ nome: item?.nome || '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (item) {
                await api.put(`${endpoint}/${item.id}`, formData);
            } else {
                await api.post(endpoint, formData);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar item");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalBase title={`${item ? 'Editar' : 'Novo'} ${title}`} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.nome}
                        onChange={e => setFormData({ ...formData, nome: e.target.value })}
                    />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" loading={loading}>Salvar</Button>
                </div>
            </form>
        </ModalBase>
    );
};

export const ClientClassificationFormModal = ({ classification, onClose, onSuccess }) => {
    const api = new Api();
    const [loading, setLoading] = useState(false);
    const [tipoCategoria, setTipoCategoria] = useState(classification?.tipo_categoria || 'quantidade');

    const [formData, setFormData] = useState({
        nome: classification?.nome || '',
        quantidade: classification?.quantidade || '',
        valor: classification?.valor || ''
    });

    const isEditing = !!classification;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            nome: formData.nome,
            tipo_categoria: tipoCategoria,
            quantidade: tipoCategoria === 'quantidade' && formData.quantidade ? parseInt(formData.quantidade) : null,
            valor: tipoCategoria === 'valor' && formData.valor ? parseFloat(formData.valor) : null
        };

        try {
            if (isEditing) {
                await api.put(`/classificacoes-clientes/${classification.id}`, payload);
            } else {
                await api.post('/classificacoes-clientes', payload);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar classificação");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalBase title={isEditing ? 'Editar Classificação' : 'Nova Classificação'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.nome}
                        onChange={e => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Ex: Top 30, VIP, etc."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Critério</label>
                    <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="tipo_categoria"
                                value="quantidade"
                                checked={tipoCategoria === 'quantidade'}
                                onChange={() => setTipoCategoria('quantidade')}
                                className="text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-slate-700">Por Quantidade (Ranking)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="tipo_categoria"
                                value="valor"
                                checked={tipoCategoria === 'valor'}
                                onChange={() => setTipoCategoria('valor')}
                                className="text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-slate-700">Por Valor Mínimo</span>
                        </label>
                    </div>
                </div>

                {tipoCategoria === 'quantidade' && (
                    <div className="animate-fade-in">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Quantidade de Clientes (Top X)
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            className="w-full px-3 py-2 border rounded-md"
                            value={formData.quantidade}
                            onChange={e => setFormData({ ...formData, quantidade: e.target.value })}
                            placeholder="Ex: 30 para os 30 maiores"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Esta classificação será aplicada automaticamente aos {formData.quantidade || 'X'} maiores clientes.
                        </p>
                    </div>
                )}

                {tipoCategoria === 'valor' && (
                    <div className="animate-fade-in">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Valor Mínimo (R$)
                        </label>
                        <input
                            type="number"
                            required
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border rounded-md"
                            value={formData.valor}
                            onChange={e => setFormData({ ...formData, valor: e.target.value })}
                            placeholder="0.00"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Esta classificação será aplicada a clientes com faturamento acima deste valor.
                        </p>
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" loading={loading}>Salvar</Button>
                </div>
            </form>
        </ModalBase>
    );
};

export const GroupFormModal = ({ group, onClose, onSuccess }) => {
    const api = new Api();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: group?.nome || ''
    });

    const isEditing = !!group;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing) {
                await api.put(`/grupos-economicos/${group.id}`, formData);
            } else {
                await api.post('/grupos-economicos', formData);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar grupo econômico");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalBase title={isEditing ? 'Editar Grupo Econômico' : 'Novo Grupo Econômico'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.nome}
                        onChange={e => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Nome do Grupo"
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" loading={loading}>Salvar</Button>
                </div>
            </form>
        </ModalBase>
    );
};
