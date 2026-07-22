import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Save, AlertCircle } from 'lucide-react';
import Api from '../utils/api';
import BackButton from '../components/ui/BackButton';
import { useGoBack } from '../context/NavigationContext';
import { useFormGuard } from '../hooks/useFormGuard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { fetchCnpjData } from '../utils/cnpj';
// Simple formatter if not imported or to ensure consistency
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

const SectionTitle = ({ title }) => (
    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 mt-6 first:mt-0">
        {title}
    </h3>
);

const FormGroup = ({ label, required, children }) => (
    <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {children}
    </div>
);

const Input = ({ value, ...props }) => {
    const safeValue = value === null || value === undefined ? '' : value;
    return (
        <input
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
            focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 dark:bg-slate-800/50 disabled:text-slate-500 dark:text-slate-400 transition-colors"
            value={safeValue}
            {...props}
        />
    );
};

const Select = ({ children, ...props }) => (
    <select
        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
        focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 dark:bg-slate-800/50 disabled:text-slate-500 dark:text-slate-400 transition-colors"
        {...props}
    >
        {children}
    </select>
);

const EMPTY_CLIENT_FORM = {
    razao_social: "",
    nome_fantasia: "",
    cpf_cnpj: "",
    id_usuario: "",
    vp: "",
    id_segmento: "",
    id_grupo_economico: "",
    tipo_unidade: "",
    nps: "",
    gestor_contratos_nome: "",
    gestor_contratos_email: "",
    gestor_contratos_nascimento: "",
    gestor_contratos_telefone_1: "",
    gestor_contratos_telefone_2: "",
    gestor_chamados_nome: "",
    gestor_chamados_email: "",
    gestor_chamados_nascimento: "",
    gestor_chamados_telefone_1: "",
    gestor_chamados_telefone_2: "",
    gestor_financeiro_nome: "",
    gestor_financeiro_email: "",
    gestor_financeiro_nascimento: "",
    gestor_financeiro_telefone_1: "",
    gestor_financeiro_telefone_2: "",
};

const ClientForm = () => {
    const api = new Api();
    const { id } = useParams();
    const mode = id ? 'edicao' : 'cadastro';

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [baseline, setBaseline] = useState(null);

    const [users, setUsers] = useState([]);
    const [segments, setSegments] = useState([]);
    const [groups, setGroups] = useState([]);
    const [formData, setFormData] = useState(EMPTY_CLIENT_FORM);

    const goBack = useGoBack('/clientes');
    const { confirmSave, requestLeave, onSaveSuccess } = useFormGuard({
        formData,
        baseline,
        enabled: !loading,
        fallback: '/clientes',
        entityLabel: 'o cliente',
        isCreate: mode === 'cadastro',
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [usersRes, segmentsRes, groupsRes] = await Promise.all([
                    api.get('/usuarios'),
                    api.get('/segmentos'),
                    api.get('/grupos-economicos')
                ]);

                setUsers(usersRes.usuarios || []);
                setSegments(segmentsRes.segmentos || []);
                setGroups(groupsRes.grupoEconomico || []);

                if (mode === 'edicao' && id) {
                    const clientRes = await api.get(`/clientes/${id}`);
                    if (clientRes.cliente) {
                        const data = clientRes.cliente;
                        // Format dates
                        data.gestor_contratos_nascimento = formatDateForInput(data.gestor_contratos_nascimento);
                        data.gestor_chamados_nascimento = formatDateForInput(data.gestor_chamados_nascimento);
                        data.gestor_financeiro_nascimento = formatDateForInput(data.gestor_financeiro_nascimento);

                        const loaded = { ...EMPTY_CLIENT_FORM, ...data };
                        setFormData(loaded);
                        setBaseline(loaded);
                    }
                } else {
                    setBaseline(EMPTY_CLIENT_FORM);
                }
            } catch (error) {
                console.error("Error loading form data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [mode, id]);
    const [searchingCNPJ, setSearchingCNPJ] = useState(false);

    const handleSearchCNPJ = async () => {
        setSearchingCNPJ(true);
        try {
            const data = await fetchCnpjData(formData.cpf_cnpj);

            setFormData(prev => ({
                ...prev,
                razao_social: data.nome || prev.razao_social,
                nome_fantasia: data.fantasia || data.nome || prev.nome_fantasia,
                tipo_unidade: data.tipo === "MATRIZ" ? "pai" : data.tipo === "FILIAL" ? "filha" : prev.tipo_unidade,
            }));
            
        } catch (error) {
            alert(error.message);
        } finally {
            setSearchingCNPJ(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!(await confirmSave())) return;

        setSaving(true);
        try {
            const payload = {
                ...formData,
                id_grupo_economico: formData.id_grupo_economico ? Number(formData.id_grupo_economico) : null,
                vp: formData.vp ? Number(formData.vp) : null,
                tipo_unidade: formData.tipo_unidade || null,
            };

            if (mode === 'cadastro') {
                await api.post('/clientes', payload);
            } else {
                await api.put(`/clientes/${id}`, payload);
            }
            onSaveSuccess();
            goBack();
        } catch (error) {
            console.error("Error saving client", error);
            alert("Erro ao salvar cliente. Verifique o console.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Skeleton className="h-96 w-full" />;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <BackButton fallback="/clientes" onClick={requestLeave} className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-full" />
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {mode === 'cadastro' ? 'Novo Cliente' : 'Editar Cliente'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Preencha os dados abaixo para {mode === 'cadastro' ? 'cadastrar um novo' : 'editar o'} cliente.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6">
                    <SectionTitle title="Dados da Empresa" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormGroup label="Razão Social" required>
                            <Input name="razao_social" value={formData.razao_social} onChange={handleChange} required placeholder="Razão social completa" />
                        </FormGroup>
                        <FormGroup label="Nome Fantasia" required>
                            <Input name="nome_fantasia" value={formData.nome_fantasia} onChange={handleChange} required placeholder="Nome popular" />
                        </FormGroup>
                        <FormGroup label="CPF/CNPJ" required>
                            <div className="flex gap-2">
                                <Input name="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleChange} required placeholder="00.000.000/0000-00" />
                                {mode === 'cadastro' && (
                                    <Button type="button" variant="outline" onClick={handleSearchCNPJ} disabled={searchingCNPJ}>
                                        {searchingCNPJ ? 'Buscando...' : 'Buscar'}
                                    </Button>
                                )}
                            </div>
                        </FormGroup>
                        <FormGroup label="Relacionamento" required>
                            <Select name="id_usuario" value={formData.id_usuario} onChange={handleChange} required>
                                <option value="">Selecione um gestor...</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                            </Select>
                        </FormGroup>
                        <FormGroup label="VP">
                            <Select name="vp" value={formData.vp} onChange={handleChange}>
                                <option value="">Selecione um VP...</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                            </Select>
                        </FormGroup>
                        <FormGroup label="Segmento" required>
                            <Select name="id_segmento" value={formData.id_segmento} onChange={handleChange} required>
                                <option value="">Selecione...</option>
                                {segments.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                            </Select>
                        </FormGroup>
                        <FormGroup label="Grupo Econômico">
                            <Select name="id_grupo_economico" value={formData.id_grupo_economico} onChange={handleChange}>
                                <option value="">Nenhum / Selecione...</option>
                                {groups.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
                            </Select>
                        </FormGroup>
                        <FormGroup label="Tipo de Unidade">
                            <Select name="tipo_unidade" value={formData.tipo_unidade} onChange={handleChange}>
                                <option value="">Selecione...</option>
                                <option value="pai">Matriz (Pai)</option>
                                <option value="filha">Filial (Filha)</option>
                            </Select>
                        </FormGroup>
                        <FormGroup label="NPS">
                            <Input name="nps" value={formData.nps} onChange={handleChange} placeholder="Score" />
                        </FormGroup>
                    </div>

                    <SectionTitle title="Gestor de Contrato" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormGroup label="Nome" required>
                            <Input name="gestor_contratos_nome" value={formData.gestor_contratos_nome} onChange={handleChange} required />
                        </FormGroup>
                        <FormGroup label="Email" required>
                            <Input name="gestor_contratos_email" type="email" value={formData.gestor_contratos_email} onChange={handleChange} required />
                        </FormGroup>
                        <FormGroup label="Aniversário">
                            <Input name="gestor_contratos_nascimento" type="date" value={formData.gestor_contratos_nascimento} onChange={handleChange} />
                        </FormGroup>
                        <FormGroup label="Telefone 1" required>
                            <Input name="gestor_contratos_telefone_1" value={formData.gestor_contratos_telefone_1} onChange={handleChange} required />
                        </FormGroup>
                        <FormGroup label="Telefone 2">
                            <Input name="gestor_contratos_telefone_2" value={formData.gestor_contratos_telefone_2} onChange={handleChange} />
                        </FormGroup>
                    </div>

                    <SectionTitle title="Gestor de Chamados" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormGroup label="Nome">
                            <Input name="gestor_chamados_nome" value={formData.gestor_chamados_nome} onChange={handleChange} />
                        </FormGroup>
                        <FormGroup label="Email">
                            <Input name="gestor_chamados_email" type="email" value={formData.gestor_chamados_email} onChange={handleChange} />
                        </FormGroup>
                        <FormGroup label="Aniversário">
                            <Input name="gestor_chamados_nascimento" type="date" value={formData.gestor_chamados_nascimento} onChange={handleChange} />
                        </FormGroup>
                        <FormGroup label="Telefone 1">
                            <Input name="gestor_chamados_telefone_1" value={formData.gestor_chamados_telefone_1} onChange={handleChange} />
                        </FormGroup>
                        <FormGroup label="Telefone 2">
                            <Input name="gestor_chamados_telefone_2" value={formData.gestor_chamados_telefone_2} onChange={handleChange} />
                        </FormGroup>
                    </div>

                    <SectionTitle title="Gestor Financeiro" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormGroup label="Nome">
                            <Input name="gestor_financeiro_nome" value={formData.gestor_financeiro_nome} onChange={handleChange} />
                        </FormGroup>
                        <FormGroup label="Email">
                            <Input name="gestor_financeiro_email" type="email" value={formData.gestor_financeiro_email} onChange={handleChange} />
                        </FormGroup>
                        <FormGroup label="Aniversário">
                            <Input name="gestor_financeiro_nascimento" type="date" value={formData.gestor_financeiro_nascimento} onChange={handleChange} />
                        </FormGroup>
                        <FormGroup label="Telefone 1">
                            <Input name="gestor_financeiro_telefone_1" value={formData.gestor_financeiro_telefone_1} onChange={handleChange} />
                        </FormGroup>
                        <FormGroup label="Telefone 2">
                            <Input name="gestor_financeiro_telefone_2" value={formData.gestor_financeiro_telefone_2} onChange={handleChange} />
                        </FormGroup>
                    </div>
                </Card>

                <div className="flex justify-end gap-3 sticky bottom-4">
                    <Button type="button" variant="secondary" onClick={requestLeave}>
                        Cancelar
                    </Button>
                    <Button type="submit" icon={Save} loading={saving}>
                        {mode === 'cadastro' ? 'Cadastrar Cliente' : 'Salvar Alterações'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ClientForm;
