import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, FileText, History } from 'lucide-react';
import Api from '../utils/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';

// Helper to format date for input
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    } catch {
        return '';
    }
};

// Remove accents for string comparison
const removeAcentos = (str) => {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const ContractForm = () => {
    const api = new Api();
    const navigate = useNavigate();
    const { id } = useParams();
    const mode = id ? 'edicao' : 'cadastro';

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Dropdown Data
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [billers, setBillers] = useState([]); // Faturados
    const [users, setUsers] = useState({}); // Map id -> name for logs
    const [logs, setLogs] = useState([]);

    // Logic State
    const [isQuantidadeDisabled, setIsQuantidadeDisabled] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        id_cliente: "",
        id_produto: "",
        id_faturado: "",
        dia_vencimento: "",
        nome_indice: "",
        proximo_reajuste: "",
        duracao: "",
        valor_mensal: "",
        quantidade: "",
        data_inicio: "",
        email_envio: "",
        descricao: "",
        link_contrato: "",
        tipo_faturamento: "",
        renovacao_automatica: false,
        status: "ativo"
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [clientsRes, productsRes, billersRes, usersRes] = await Promise.all([
                    api.get('/clientes'),
                    api.get('/produtos'),
                    api.get('/faturados'),
                    api.get('/usuarios')
                ]);

                setClients(clientsRes.clientes || []);
                setProducts(productsRes.produtos || []);
                setBillers(billersRes.faturados || []);

                const usersMap = (usersRes.usuarios || []).reduce((acc, u) => {
                    acc[u.id] = u.nome;
                    return acc;
                }, {});
                setUsers(usersMap);

                if (mode === 'edicao' && id) {
                    const [contractRes, logsRes] = await Promise.all([
                        api.get(`/contratos/${id}`),
                        api.get(`/logs/${id}`).catch(() => ({ logs: [] })) // Handle 404/error gracefully
                    ]);

                    if (contractRes.contrato) {
                        const data = contractRes.contrato;
                        setFormData({
                            id_cliente: data.id_cliente,
                            id_produto: data.id_produto,
                            id_faturado: data.id_faturado,
                            dia_vencimento: data.dia_vencimento,
                            nome_indice: data.nome_indice || "",
                            proximo_reajuste: formatDateForInput(data.proximo_reajuste),
                            duracao: data.duracao,
                            valor_mensal: data.valor_mensal,
                            quantidade: data.quantidade,
                            data_inicio: formatDateForInput(data.data_inicio),
                            email_envio: data.email_envio || "",
                            descricao: data.descricao || "",
                            link_contrato: data.link_contrato || "",
                            tipo_faturamento: data.tipo_faturamento || "",
                            renovacao_automatica: data.renovacao_automatica || false,
                            status: data.status || "ativo"
                        });
                    }
                    setLogs(logsRes.logs || []);
                }
            } catch (error) {
                console.error("Error loading form data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [mode, id]);

    // Comparison Logic for "Quantidade" field
    useEffect(() => {
        if (!formData.id_produto || products.length === 0) {
            setIsQuantidadeDisabled(true);
            return;
        }

        const product = products.find(p => p.id === Number(formData.id_produto));
        if (product) {
            const normalizedName = removeAcentos(product.nome.trim().toLowerCase());
            const shouldEnable = normalizedName.includes("backup") || normalizedName.includes("antivirus");
            setIsQuantidadeDisabled(!shouldEnable);

            // Allow user to clear it, but don't force clear if they are editing
            if (!shouldEnable && formData.quantidade) {
                // Optional: Clear it if it shouldn't have a value, 
                // but legacy code logic was: "if (quantidade !== null) setQuantidade(null)"
                // we will respect that logic on save or just disable input
                setFormData(prev => ({ ...prev, quantidade: "" }));
            }
        }
    }, [formData.id_produto, products]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                id_cliente: Number(formData.id_cliente),
                id_produto: Number(formData.id_produto),
                id_faturado: Number(formData.id_faturado),
                dia_vencimento: Number(formData.dia_vencimento),
                duracao: Number(formData.duracao),
                valor_mensal: Number(formData.valor_mensal),
                quantidade: formData.quantidade ? Number(formData.quantidade) : null,
                // Add current user ID if needed for logs
            };

            if (mode === 'cadastro') {
                await api.post('/contratos', payload);
            } else {
                await api.put(`/contratos/${id}`, payload);
            }
            navigate('/contratos');
        } catch (error) {
            console.error("Error saving contract", error);
            alert("Erro ao salvar contrato. Verifique o console.");
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async () => {
        if (!id) return;
        const newStatus = formData.status === 'ativo' ? 'inativo' : 'ativo';
        if (window.confirm(`Deseja realmente alterar o status para ${newStatus}?`)) {
            try {
                await api.put(`/contratos/${id}`, { status: newStatus });
                setFormData(prev => ({ ...prev, status: newStatus }));
            } catch (error) {
                console.error("Error changing status", error);
            }
        }
    };

    if (loading) return <Skeleton className="h-96 w-full" />;

    const SectionTitle = ({ title }) => (
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 mt-6 first:mt-0">
            {title}
        </h3>
    );

    const FormGroup = ({ label, required, children }) => (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            {children}
        </div>
    );

    const Input = ({ ...props }) => (
        <input
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
            focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
            {...props}
        />
    );

    const Select = ({ children, ...props }) => (
        <select
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
            focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
            {...props}
        >
            {children}
        </select>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/contratos')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {mode === 'cadastro' ? 'Novo Contrato' : 'Editar Contrato'}
                        </h1>
                        <div className="flex items-center gap-2 text-slate-500">
                            <span>Preencha os dados do contrato.</span>
                            {mode === 'edicao' && (
                                <Badge variant={formData.status === 'ativo' ? 'success' : 'secondary'}>
                                    {formData.status}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
                {mode === 'edicao' && (
                    <Button variant={formData.status === 'ativo' ? 'danger' : 'success'} onClick={toggleStatus} size="sm">
                        {formData.status === 'ativo' ? 'Inativar Contrato' : 'Ativar Contrato'}
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <form id="contract-form" onSubmit={handleSubmit}>
                        <Card className="p-6">
                            <SectionTitle title="Informações Gerais" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <FormGroup label="Cliente" required>
                                        <Select name="id_cliente" value={formData.id_cliente} onChange={handleChange} required disabled={mode === 'edicao'}>
                                            <option value="">Selecione o cliente...</option>
                                            {clients.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.razao_social} - {c.nome_fantasia}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormGroup>
                                </div>

                                <FormGroup label="Faturado Por" required>
                                    <Select name="id_faturado" value={formData.id_faturado} onChange={handleChange} required>
                                        <option value="">Selecione...</option>
                                        {billers.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                                    </Select>
                                </FormGroup>

                                <FormGroup label="Solução Ofertada" required>
                                    <Select name="id_produto" value={formData.id_produto} onChange={handleChange} required>
                                        <option value="">Selecione...</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                                    </Select>
                                </FormGroup>

                                <FormGroup label="Duração do Contrato" required>
                                    <Select name="duracao" value={formData.duracao} onChange={handleChange} required>
                                        <option value="">Selecione...</option>
                                        {[6, 12, 24, 36, 48, 60].map(m => <option key={m} value={m}>{m} Meses</option>)}
                                        <option value={12000}>INDETERMINADO</option>
                                    </Select>
                                </FormGroup>

                                <FormGroup label="Data Início">
                                    <Input name="data_inicio" type="date" value={formData.data_inicio} onChange={handleChange} />
                                </FormGroup>

                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="renovacao_automatica"
                                            checked={formData.renovacao_automatica}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700">Renovação Automática</span>
                                    </label>
                                </div>
                            </div>

                            <SectionTitle title="Faturamento e Valores" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormGroup label="Dia Vencimento" required>
                                    <Select name="dia_vencimento" value={formData.dia_vencimento} onChange={handleChange} required>
                                        <option value="">Dia...</option>
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                            <option key={d} value={d}>Dia {d}</option>
                                        ))}
                                    </Select>
                                </FormGroup>

                                <FormGroup label="Índice Reajuste">
                                    <Select name="nome_indice" value={formData.nome_indice} onChange={handleChange}>
                                        <option value="">Selecione...</option>
                                        <option value="igpm">IGPM</option>
                                        <option value="ipca">IPCA</option>
                                        <option value="ipc-fipe">IPC-FIPE</option>
                                        <option value="inpc">INPC</option>
                                    </Select>
                                </FormGroup>

                                <FormGroup label="Próximo Reajuste" required>
                                    <Input name="proximo_reajuste" type="date" value={formData.proximo_reajuste} onChange={handleChange} required />
                                </FormGroup>

                                <FormGroup label="Valor Mensal" required>
                                    <Input name="valor_mensal" type="number" step="0.01" value={formData.valor_mensal} onChange={handleChange} required placeholder="0.00" />
                                </FormGroup>

                                <FormGroup label="Quantidade" required>
                                    <Input
                                        name="quantidade"
                                        type="number"
                                        value={formData.quantidade}
                                        onChange={handleChange}
                                        disabled={isQuantidadeDisabled}
                                        required={!isQuantidadeDisabled}
                                        placeholder={isQuantidadeDisabled ? "N/A" : "Qtd."}
                                    />
                                </FormGroup>

                                <FormGroup label="Tipo Faturamento" required>
                                    <Select name="tipo_faturamento" value={formData.tipo_faturamento} onChange={handleChange} required>
                                        <option value="">Selecione...</option>
                                        <option value="mensal">Mensal</option>
                                        <option value="anual">Anual</option>
                                    </Select>
                                </FormGroup>
                            </div>
                            <SectionTitle title="Detalhes Adicionais" />
                            <div className="grid grid-cols-1 gap-6">
                                <FormGroup label="Email de Envio">
                                    <Input name="email_envio" type="email" value={formData.email_envio} onChange={handleChange} placeholder="email@financeiro.com" />
                                </FormGroup>

                                <FormGroup label="Link do Contrato (SharePoint)">
                                    <Input name="link_contrato" value={formData.link_contrato} onChange={handleChange} placeholder="https://..." />
                                </FormGroup>

                                <FormGroup label="Descrição Breve">
                                    <textarea
                                        name="descricao"
                                        value={formData.descricao}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                                        rows={3}
                                    />
                                </FormGroup>
                            </div>
                        </Card>
                    </form>
                </div>

                <div className="space-y-6">
                    {/* Actions Card */}
                    <Card className="p-4 sticky top-6">
                        <h3 className="font-bold text-slate-800 mb-4">Ações</h3>
                        <div className="flex flex-col gap-3">
                            <Button type="submit" form="contract-form" icon={Save} loading={saving} fullWidth>
                                {mode === 'cadastro' ? 'Salvar Contrato' : 'Salvar Alterações'}
                            </Button>
                            <Button variant="secondary" onClick={() => navigate('/contratos')} fullWidth>
                                Cancelar
                            </Button>
                        </div>
                    </Card>

                    {/* History / Logs */}
                    {mode === 'edicao' && (
                        <Card className="p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <History className="w-5 h-5 text-slate-500" />
                                <h3 className="font-bold text-slate-800">Histórico</h3>
                            </div>
                            <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                                {logs.length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center py-4">Nenhum registro encontrado.</p>
                                ) : (
                                    logs.map((log) => (
                                        <div key={log.id} className="text-sm border-l-2 border-slate-200 pl-3 py-1">
                                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                                                <span>{users[log.id_usuario] || 'Usuário'}</span>
                                            </div>
                                            <p className="text-slate-700">{log.alteracao}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContractForm;
