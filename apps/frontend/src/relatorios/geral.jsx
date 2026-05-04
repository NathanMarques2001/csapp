import Excel from "../utils/excel";
import { useState, useEffect } from "react";
import Popup from "../componentes/pop-up";
import Api from "../utils/api";
import Carregando from "../componentes/carregando";

export default function RelatorioGeral({
    clientes,
    produtos,
    usuariosMap,
}) {
    const excel = new Excel("Relatório Geral");
    const [dados, setDados] = useState([]);
    const [carregando, setCarregando] = useState(false);

    const [filtros, setFiltros] = useState({
        nome_fantasia: "",
        produto: "",
        vendedor: "",
        status_contrato: "",
        status_cliente: "",
    });

    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [mostrarPopup, setMostrarPopup] = useState(false);

    useEffect(() => {
        const buscarDados = async () => {
            setCarregando(true);
            try {
                const api = new Api();
                const res = await api.get("/relatorios/geral");
                setDados(res || []);
            } catch (erro) {
                console.error("Erro ao buscar relatório geral:", erro);
            } finally {
                setCarregando(false);
            }
        };
        buscarDados();
    }, []);

    const dadosFiltrados = dados.filter(
        (item) =>
            (!filtros.nome_fantasia ||
                item.nome_fantasia.toLowerCase().includes(filtros.nome_fantasia.toLowerCase())) &&
            (!filtros.produto || item.solucao === filtros.produto) &&
            (!filtros.vendedor || item.vendedor === filtros.vendedor) &&
            (!filtros.status_contrato || item.status_contrato === filtros.status_contrato) &&
            (!filtros.status_cliente || item.status === filtros.status_cliente)
    );

    const dadosExportacao = dadosFiltrados.map((item) => ({
        "Razão Social": item.razao_social,
        "Nome Fantasia": item.nome_fantasia,
        "CPF/CNPJ": item.cpf_cnpj,
        "Solução": item.solucao,
        "Valor Contrato": parseFloat(item.valor_contrato || 0),
        "Data Início": item.data_inicio ? new Date(item.data_inicio).toLocaleDateString("pt-BR") : "-",
        "Data de Vencimento": item.vencimento_calculado ? new Date(item.vencimento_calculado).toLocaleDateString("pt-BR") : "-",
        "Cadastro do Cliente": item.data_criacao_cliente ? new Date(item.data_criacao_cliente).toLocaleDateString("pt-BR") : "-",
        "Vendedor": item.vendedor,
        "Status Cliente": item.status,
        "Status Contrato": item.status_contrato,
        "Gestor Chamados": item.gestor_chamados_nome,
        "Email Gestor Chamados": item.gestor_chamados_email,
        "Tel 1 Gestor Chamados": item.gestor_chamados_telefone_1,
        "Tel 2 Gestor Chamados": item.gestor_chamados_telefone_2,
        "Gestor Financeiro": item.gestor_financeiro_nome,
        "Email Gestor Financeiro": item.gestor_financeiro_email,
        "Tel 1 Gestor Financeiro": item.gestor_financeiro_telefone_1,
        "Tel 2 Gestor Financeiro": item.gestor_financeiro_telefone_2,
        "Gestor Contratos": item.gestor_contratos_nome,
        "Email Gestor Contratos": item.gestor_contratos_email,
        "Tel 1 Gestor Contratos": item.gestor_contratos_telefone_1,
        "Tel 2 Gestor Contratos": item.gestor_contratos_telefone_2,
    }));

    function baixarRelatorio(e) {
        e.preventDefault();
        excel.exportToExcel(dadosExportacao);
        setMostrarPopup(false);
    }

    function aoMudarFiltro(e) {
        setFiltros({ ...filtros, [e.target.name]: e.target.value });
    }

    if (carregando) return <div>Carregando...</div>;

    return (
        <>
            {mostrarPopup && (
                <Popup
                    title="Exportar Relatório Geral"
                    message="Tem certeza que deseja exportar este relatório?"
                    onConfirm={baixarRelatorio}
                    onCancel={() => setMostrarPopup(false)}
                />
            )}

            {mostrarFiltros && (
                <div id="filter-container">
                    <form onSubmit={(e) => e.preventDefault()} className="filter-form">
                        <div className="form-group">
                            <label>Cliente (Nome Fantasia):</label>
                            <select
                                name="nome_fantasia"
                                value={filtros.nome_fantasia}
                                onChange={aoMudarFiltro}
                            >
                                <option value="">Selecione</option>
                                {clientes.map((c) => (
                                    <option key={c.id} value={c.nome_fantasia}>{c.nome_fantasia}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Produto:</label>
                            <select
                                name="produto"
                                value={filtros.produto}
                                onChange={aoMudarFiltro}
                            >
                                <option value="">Selecione</option>
                                {produtos.map((p) => (
                                    <option key={p.id} value={p.nome}>
                                        {p.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Vendedor:</label>
                            <select
                                name="vendedor"
                                value={filtros.vendedor}
                                onChange={aoMudarFiltro}
                            >
                                <option value="">Selecione</option>
                                {Object.values(usuariosMap).map((usuario) => (
                                    <option key={usuario.id} value={usuario.nome}>
                                        {usuario.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Status Contrato:</label>
                            <select
                                name="status_contrato"
                                value={filtros.status_contrato}
                                onChange={aoMudarFiltro}
                            >
                                <option value="">Selecione</option>
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Status Cliente:</label>
                            <select
                                name="status_cliente"
                                value={filtros.status_cliente}
                                onChange={aoMudarFiltro}
                            >
                                <option value="">Selecione</option>
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={() => setMostrarFiltros(false)}
                            id="filter-close-button"
                            className="filter-button"
                        >
                            Fechar
                        </button>
                    </form>
                </div>
            )}

            <button
                onClick={() => setMostrarFiltros(true)}
                className="relatorio-button"
                id="relatorio-button-filtrar"
            >
                Filtrar
            </button>
            <button
                onClick={() => setMostrarPopup(true)}
                className="relatorio-button"
                id="relatorio-button-exportar"
            >
                Exportar para Excel
            </button>

            <table className="global-tabela">
                <thead>
                    <tr>
                        <th className="global-titulo-tabela">Nome Fantasia</th>
                        <th className="global-titulo-tabela">CPF/CNPJ</th>
                        <th className="global-titulo-tabela">Solução</th>
                        <th className="global-titulo-tabela">Valor</th>
                        <th className="global-titulo-tabela">Vendedor</th>
                        <th className="global-titulo-tabela">Status Cli.</th>
                        <th className="global-titulo-tabela">Status Cont.</th>
                        <th className="global-titulo-tabela">Gestor Chamados</th>
                        <th className="global-titulo-tabela">Gestor Financeiro</th>
                    </tr>
                </thead>
                <tbody>
                    {dadosFiltrados.map((item, index) => (
                        <tr key={index}>
                            <td className="global-conteudo-tabela">{item.nome_fantasia}</td>
                            <td className="global-conteudo-tabela">{item.cpf_cnpj}</td>
                            <td className="global-conteudo-tabela">{item.solucao}</td>
                            <td className="global-conteudo-tabela">
                                {parseFloat(item.valor_contrato).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                })}
                            </td>
                            <td className="global-conteudo-tabela">{item.vendedor}</td>
                            <td className="global-conteudo-tabela">{item.status}</td>
                            <td className="global-conteudo-tabela">{item.status_contrato}</td>
                            <td className="global-conteudo-tabela">{item.gestor_chamados_nome}</td>
                            <td className="global-conteudo-tabela">{item.gestor_financeiro_nome}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
