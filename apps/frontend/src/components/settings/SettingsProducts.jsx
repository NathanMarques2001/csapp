import { useState, useEffect } from 'react';
import { Plus, Edit2, Archive, CheckCircle, Search } from 'lucide-react';
import Input from '../ui/Input';
import Card from '../ui/Card';
import Api from '../../utils/api';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Skeleton from '../ui/Skeleton';
import { ProductFormModal } from './SettingsModals';

const SettingsProducts = () => {
    const api = new Api();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [manufacturer, setManufacturer] = useState([]);
    const [manufacturerMap, setManufacturerMap] = useState({});
    const [categories, setCategories] = useState([]);
    const [categoriesMap, setCategoriesMap] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProducts = async () => {
        try {
            const res = await api.get('/produtos');
            setProducts(res.produtos || []);
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchManufacturers = async () => {
        try {
            const res = await api.get('/fabricantes');

            const lista = res.fabricantes || [];

            setManufacturer(lista);

            const mapa = res.fabricantes.reduce((map, fabricante) => {
                map[fabricante.id] = fabricante.nome;
                return map;
            }, {});

            setManufacturerMap(mapa);

        } catch (error) {
            console.error("Error loading manufacturers:", error);
        } finally {
            setLoading(false);
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categorias-produtos');

            const lista = res.categorias || [];

            setCategories(lista);

            const mapa = res.categorias.reduce((map, categoria) => {
                map[categoria.id] = categoria.nome;
                return map;
            }, {});

            setCategoriesMap(mapa);
            console.log(categoriesMap)

        } catch (error) {
            console.error("Error loading manufacturers:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProducts();
        fetchManufacturers();
        fetchCategories();
    }, []);

    const handleEdit = (product) => {
        setEditingProduct(product);
        setModalOpen(true);
    };

    const handleNew = () => {
        setEditingProduct(null);
        setModalOpen(true);
    };

    const handleSuccess = () => {
        setModalOpen(false);
        fetchProducts();
    };

    const toggleStatus = async (product) => {
        if (window.confirm("Deseja alterar o status deste produto?")) {
            try {
                const newStatus = product.status === 'ativo' ? 'inativo' : 'ativo';
                await api.put(`/produtos/${product.id}`, { status: newStatus });
                fetchProducts();
            } catch (error) {
                console.error(error);
            }
        }
    };

    if (loading) return <Skeleton className="h-40 w-full" />;

    console.log(manufacturer)

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900">Produtos e Serviços</h2>
                <Button icon={Plus} size="sm" onClick={handleNew}>Novo Produto</Button>
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
                            <th className="px-6 py-3">Fornecedor</th>
                            <th className="px-6 py-3">Categoria</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {products.filter(p =>
                            p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (manufacturerMap[p.id_fabricante] && manufacturerMap[p.id_fabricante].toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (categoriesMap[p.id_categoria_produto] && categoriesMap[p.id_categoria_produto].toLowerCase().includes(searchTerm.toLowerCase()))
                        ).map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                                <td className="px-6 py-3 font-medium text-slate-900">{p.nome}</td>
                                <td className="px-6 py-3 text-slate-500">{manufacturerMap[p.id_fabricante] || '-'}</td>
                                <td className="px-6 py-3 text-slate-500">{categoriesMap[p.id_categoria_produto] || '-'}</td>
                                <td className="px-6 py-3">
                                    <Badge status={p.status === 'ativo' ? 'Ativo' : 'Inativo'} />
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleEdit(p)} className="text-slate-400 hover:text-teal-600 transition-colors" title="Editar">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => toggleStatus(p)} className="text-slate-400 hover:text-indigo-600 transition-colors" title="Alterar Status">
                                            {p.status === 'ativo' ? <Archive className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <ProductFormModal
                    product={editingProduct}
                    onClose={() => setModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default SettingsProducts;
