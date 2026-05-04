import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Plus, Sparkles, ChevronRight, Check, FileText, CheckCircle, XCircle, Package, Factory } from 'lucide-react';
import Api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import ContactCard from '../components/ui/ContactCard';

const ClientDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const api = new Api();
    const [activeTab, setActiveTab] = useState('overview');

    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState(null);
    const [contracts, setContracts] = useState([]);

    const [products, setProducts] = useState({});
    const [manufacturers, setManufacturers] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [clientRes, contractsRes, productsRes, manufacturersRes] = await Promise.all([
                    api.get(`/clientes/${id}`),
                    api.get(`/contratos/cliente/${id}`),
                    api.get('/produtos'),
                    api.get('/fabricantes')
                ]);

                setClient(clientRes.cliente);
                setContracts(contractsRes.contratos || []);

                const prodMap = (productsRes.produtos || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
                setProducts(prodMap);

                const manufMap = (manufacturersRes.fabricantes || []).reduce((acc, m) => ({ ...acc, [m.id]: m.nome }), {});
                setManufacturers(manufMap);

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    if (loading) return <div className="space-y-4"><Skeleton className="h-40 w-full" /><div className="grid grid-cols-3 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div></div>;

    if (!client) return <div>Cliente não encontrado</div>;

    // Metrics Calculation
    const activeContracts = contracts.filter(c => c.status === 'ativo');
    const inactiveContracts = contracts.filter(c => c.status === 'inativo');

    // Assuming 'valor_mensal' is the monthly value for both types, or the annual value for annual?
    // Based on ARR logic (monthly * 12, annual * 1):
    // If 'mensal', value is monthly. ARR = value * 12.
    // If 'anual', value is annual. ARR = value.
    // So for MRR:
    // If 'mensal', MRR = value.
    // If 'anual', MRR = value / 12.
    const totalARR = activeContracts.reduce((acc, c) => {
        const value = Number(c.valor_mensal || 0);
        return acc + (c.tipo_faturamento === 'mensal' ? value * 12 : value);
    }, 0);

    const totalMRR = activeContracts.reduce((acc, c) => {
        const value = Number(c.valor_mensal || 0);
        return acc + (c.tipo_faturamento === 'mensal' ? value : value / 12);
    }, 0);

    // Função para calcular o próximo vencimento (ported from legacy)
    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        let data = new Date(dateStr);
        if (typeof dateStr === 'string' && dateStr.includes('-')) {
            const parts = dateStr.split('-');
            if (parts[0].length === 4) {
                // YYYY-MM-DD
                data = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            } else {
                // DD-MM-YYYY
                data = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
        }
        return isNaN(data.getTime()) ? null : data;
    };

    const calcularProximoVencimento = (dataInicio, duracao) => {
        if (!dataInicio) return null;
        const duracaoMeses = parseInt(duracao);
        if (!duracaoMeses || duracaoMeses <= 0) return null;
        if (duracaoMeses === 12000) return "Indeterminado";

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        let data = parseDate(dataInicio);
        if (!data) return null;

        data.setMonth(data.getMonth() + duracaoMeses);

        if (data < hoje) {
            let safeCounter = 0;
            while (data < hoje && safeCounter < 1000) {
                data.setMonth(data.getMonth() + duracaoMeses);
                safeCounter++;
            }
        }

        return data;
    };

    // Next Readjustment
    const nextReadjustment = activeContracts
        .map(c => ({ ...c, parsedReadjustment: parseDate(c.proximo_reajuste) }))
        .filter(c => c.parsedReadjustment && c.parsedReadjustment > new Date())
        .sort((a, b) => a.parsedReadjustment - b.parsedReadjustment)[0];

    // Find next renewal
    const nextRenewalClient = activeContracts
        .map(c => {
            const vencimento = calcularProximoVencimento(c.data_inicio, c.duracao);
            return {
                ...c,
                vencimentoCalculado: vencimento
            };
        })
        .filter(c => c.vencimentoCalculado instanceof Date && c.vencimentoCalculado > new Date())
        .sort((a, b) => a.vencimentoCalculado - b.vencimentoCalculado)[0];

    const handleGenerateInsight = () => {
        setGeneratingInsight(true);
        setTimeout(() => setGeneratingInsight(false), 2000); // Simulate API call
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/clientes')} className="p-2"><ArrowLeft className="w-5 h-5" /></Button>
                        <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 text-xl font-bold">
                            {(client.nome_fantasia || client.nomeFantasia || 'CL').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{client.nome_fantasia || client.nomeFantasia}</h1>
                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                <span>CNPJ: {client.cpf_cnpj || client.cnpj}</span>
                                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                                <span>{client.segmento}</span>
                                <Badge status={client.status} />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" icon={Edit2} onClick={() => navigate(`/clientes/editar/${id}`)}>Editar Cliente</Button>
                        <Button icon={Plus} onClick={() => navigate('/contratos/novo')}>Novo Contrato</Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 mt-8 border-b border-slate-200">
                    {['Overview', 'Contatos', 'Contratos', 'Histórico'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`pb-3 text-sm font-medium transition-colors ${activeTab === tab.toLowerCase()
                                ? 'text-teal-600 border-b-2 border-teal-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab === 'Overview' ? 'Visão Geral' : tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Receita Anual Recorrente (ARR)</h3>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalARR)}</p>
                            <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                                <span className="bg-emerald-100 px-1.5 py-0.5 rounded">+12%</span> vs ano anterior
                            </div>
                        </Card>
                        <Card className="p-6">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Contratos Ativos</h3>
                            <p className="text-2xl font-bold text-slate-900">{activeContracts.length}</p>
                        </Card>
                        <Card className="p-6">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Próxima Renovação</h3>
                            <div className="flex flex-col">
                                <p className="text-2xl font-bold text-slate-900">
                                    {nextRenewalClient ? (
                                        <>
                                            <span className="text-lg font-normal text-slate-400">#{nextRenewalClient.id} - </span>
                                            {formatDate(nextRenewalClient.vencimentoCalculado)}
                                        </>
                                    ) : '-'}
                                </p>
                                {nextRenewalClient && (
                                    <p className="text-sm text-amber-600 mt-1">
                                        Faltam {Math.ceil((nextRenewalClient.vencimentoCalculado - new Date()) / (1000 * 60 * 60 * 24))} dias
                                    </p>
                                )}
                            </div>
                        </Card>
                        <Card className="p-6">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Receita Mensal Recorrente (MRR)</h3>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalMRR)}</p>
                        </Card>
                        <Card className="p-6">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Contratos Inativos</h3>
                            <p className="text-2xl font-bold text-slate-900">{inactiveContracts.length}</p>
                        </Card>
                        <Card className="p-6">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Próximo Reajuste</h3>
                            <div className="flex flex-col">
                                <p className="text-2xl font-bold text-slate-900">
                                    {nextReadjustment ? (
                                        <>
                                            <span className="text-lg font-normal text-slate-400">#{nextReadjustment.id} - </span>
                                            {formatDate(nextReadjustment.parsedReadjustment)}
                                        </>
                                    ) : '-'}
                                </p>
                                {nextReadjustment && (
                                    <p className="text-sm text-slate-500 mt-1">
                                        Faltam {Math.ceil((nextReadjustment.parsedReadjustment - new Date()) / (1000 * 60 * 60 * 24))} dias
                                    </p>
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6">
                            <h3 className="font-bold mb-4 text-slate-900">Principais Contatos</h3>
                            <div className="space-y-4">
                                {/* Simplified List for Overview */}
                                {[
                                    { role: 'Gestor de Contratos', name: client.gestor_contratos_nome, email: client.gestor_contratos_email },
                                    { role: 'Gestor Financeiro', name: client.gestor_financeiro_nome, email: client.gestor_financeiro_email }
                                ].filter(Boolean).map((contact, idx) => (
                                    contact.name ? (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer" onClick={() => setActiveTab('contatos')}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700">
                                                    {contact.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{contact.name}</p>
                                                    <p className="text-xs text-slate-500">{contact.role}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                        </div>
                                    ) : null
                                ))}
                                {(!client.gestor_contratos_nome && !client.gestor_financeiro_nome) && <p className="text-slate-500 text-sm">Nenhum contato cadastrado.</p>}
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="font-bold mb-4 text-slate-900">Últimos Contratos</h3>
                            <div className="space-y-3">
                                {contracts.slice(0, 4).map(c => (
                                    <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors" onClick={() => navigate(`/contratos/${c.id}/editar`)}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">
                                                    Contrato #{c.id} - {products[c.id_produto]?.nome || `Produto ${c.id_produto}`}
                                                </p>
                                                <p className="text-xs text-slate-500 capitalize">
                                                    {formatCurrency(c.valor_mensal)} - {c.tipo_faturamento}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge status={c.status} />
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                ))}
                                {contracts.length === 0 && <p className="text-sm text-slate-500">Nenhum contrato encontrado.</p>}
                            </div>
                        </Card>
                    </div>
                </>
            )}

            {activeTab === 'contatos' && (
                <div className="space-y-8">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 mb-4">Gestores Principais</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ContactCard title="Gestor de Contratos"
                                name={client.gestor_contratos_nome}
                                email={client.gestor_contratos_email}
                                phone={client.gestor_contratos_telefone_1}
                            />
                            <ContactCard title="Gestor Financeiro"
                                name={client.gestor_financeiro_nome}
                                email={client.gestor_financeiro_email}
                                phone={client.gestor_financeiro_telefone_1}
                            />
                            <ContactCard title="Gestor de Chamados"
                                name={client.gestor_chamados_nome}
                                email={client.gestor_chamados_email}
                                phone={client.gestor_chamados_telefone_1}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-slate-900">Contatos Comerciais</h3>
                            <Button variant="ghost" size="sm" icon={Plus}>Adicionar</Button>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-8 text-center text-slate-500 border border-dashed border-slate-300">
                            Nenhum contato comercial adicional cadastrado.
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-slate-900">Contatos Técnicos</h3>
                            <Button variant="ghost" size="sm" icon={Plus}>Adicionar</Button>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-8 text-center text-slate-500 border border-dashed border-slate-300">
                            Nenhum contato técnico adicional cadastrado.
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'contratos' && (
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    {/* Totals Header */}
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-end gap-6 text-sm">
                        <div className="text-right">
                            <p className="text-slate-500 uppercase tracking-wider text-xs mb-1">Faturamento Mensal</p>
                            <p className="font-bold text-slate-700 text-lg">
                                {formatCurrency(contracts
                                    .filter(c => c.status === 'ativo' && c.tipo_faturamento === 'mensal')
                                    .reduce((acc, c) => acc + Number(c.valor_mensal || 0), 0)
                                )}
                            </p>
                        </div>
                        <div className="text-right pl-6 border-l border-slate-200">
                            <p className="text-slate-500 uppercase tracking-wider text-xs mb-1">Faturamento Anual</p>
                            <p className="font-bold text-slate-700 text-lg">
                                {formatCurrency(contracts
                                    .filter(c => c.status === 'ativo' && c.tipo_faturamento === 'anual')
                                    .reduce((acc, c) => acc + Number(c.valor_mensal || 0), 0)
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Solução</th>
                                    <th className="px-6 py-3">Contratação</th>
                                    <th className="px-6 py-3">Valor</th>
                                    <th className="px-6 py-3">Recorrência</th>
                                    <th className="px-6 py-3">Fabricante</th>
                                    <th className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {contracts.length === 0 ? (
                                    <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-400 italic">Nenhum contrato encontrado</td></tr>
                                ) : (
                                    contracts.map(contract => {
                                        const product = products[contract.id_produto];
                                        const manufacturerName = product ? manufacturers[product.id_fabricante] : '-';

                                        return (
                                            <tr key={contract.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/contratos/${contract.id}`)}>
                                                <td className="px-6 py-4">
                                                    {contract.status === 'ativo'
                                                        ? <span className="flex items-center gap-1.5 text-emerald-600 font-medium"><CheckCircle size={16} /> Ativo</span>
                                                        : <span className="flex items-center gap-1.5 text-slate-400 font-medium"><XCircle size={16} /> Inativo</span>
                                                    }
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-700">
                                                    <div className="flex items-center gap-2">
                                                        <Package size={16} className="text-indigo-400" />
                                                        {product?.nome || contract.id_produto}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    {formatDate(contract.data_inicio)}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-slate-600">
                                                    {formatCurrency(contract.valor_mensal)}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {contract.duracao === 12000 ? 'Indeterminado' : `${contract.duracao} Meses`}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    <div className="flex items-center gap-2">
                                                        <Factory size={16} className="text-slate-400" />
                                                        {manufacturerName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        className="text-slate-400 hover:text-teal-600"
                                                        size="sm"
                                                        icon={Edit2}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/contratos/${contract.id}/editar`);
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'histórico' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-900">Fatos Relevantes</h3>
                        <Button variant="outline" size="sm" icon={Plus}>Novo Fato</Button>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex gap-4">
                            <div className="mt-1">
                                <div className="w-2 h-2 rounded-full bg-slate-300 mt-2"></div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">Cliente criado no sistema (Legado)</p>
                                <p className="text-xs text-slate-500 mt-1">01/01/2023 às 10:00 por Sistema</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-8 text-center text-slate-500 border border-dashed border-slate-300">
                        Nenhum outro registro de histórico encontrado.
                    </div>
                </div>
            )}

            <div className="mt-12 pt-6 border-t border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Zona de Perigo</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <p className="font-medium text-red-900">Inativar Cliente</p>
                        <p className="text-sm text-red-700 mt-1">Ao inativar o cliente, todos os contratos ativos serão automaticamente suspensos.</p>
                    </div>
                    <Button
                        className="bg-red-600 text-white hover:bg-red-700 border-transparent shadow-sm"
                        onClick={() => {
                            if (window.confirm("FATAL: Tem certeza? Isso inativará todos os contratos deste cliente.")) {
                                alert("Cliente inativado (Mock)");
                            }
                        }}
                    >
                        Inativar Cliente
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ClientDetails;
