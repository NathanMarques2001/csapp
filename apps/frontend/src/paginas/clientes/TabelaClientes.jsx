import React, { Fragment, useState } from "react";
import { FaUser, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Formatadores from "../../utils/formatadores";

export default function TabelaClientes({
    clientesGrupos,
    clientesSemGrupo,
    vendedores,
    classificacoes,
    totais,
    funcoes
}) {
    const navigate = useNavigate();
    const [grupoAbertoId, setGrupoAbertoId] = useState(null);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const ITENS_POR_PAGINA = 50;

    // Lógica de Paginação
    // Combina para paginar
    const itensCombinados = [
        ...clientesGrupos.map((grupo) => ({ tipo: "grupo", dados: grupo })),
        ...clientesSemGrupo.map((cliente) => ({ tipo: "cliente", dados: cliente })),
    ];

    const totalPaginas = Math.max(1, Math.ceil(itensCombinados.length / ITENS_POR_PAGINA));
    const paginaExibida = Math.min(Math.max(1, paginaAtual), totalPaginas);

    const itensPaginados = itensCombinados.slice(
        (paginaExibida - 1) * ITENS_POR_PAGINA,
        paginaExibida * ITENS_POR_PAGINA
    );

    // Navegação
    const irParaPagina = (pag) => setPaginaAtual(Math.max(1, Math.min(pag, totalPaginas)));

    // Helpers de Renderização
    const obterMatriz = (grupo) =>
        grupo.unidades.find((c) => c.tipo_unidade === "matriz") || grupo.unidades[0];

    const calcularTotalGrupo = (grupo) =>
        grupo.unidades.reduce(
            (total, cliente) => total + funcoes.calcularValorTotalContratos(cliente.id),
            0
        );

    /*
  const formatarMoeda = (valor) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  */
    // Removed local function in favor of Formatadores

    const renderizarLinhaGrupo = (item) => {
        const { grupo, unidades } = item.dados;
        const matriz = obterMatriz(item.dados);
        const total = calcularTotalGrupo(item.dados);
        const aberto = grupoAbertoId === grupo.id;

        return (
            <Fragment key={`grupo-${grupo.id}`}>
                <tbody
                    className={`grupo-unidades ${aberto ? "aberto" : ""}`}
                    onMouseEnter={() => setGrupoAbertoId(grupo.id)}
                    onMouseLeave={() => setGrupoAbertoId(null)}
                >
                    <tr
                        className={aberto ? "clientes-conteudo-tabela-grupo-aberto" : ""}
                        onClick={() => navigate(`/grupo-economico/${grupo.id}`)}
                    >
                        <td className="clientes-conteudo-tabela">{grupo.nome}</td>
                        <td className="clientes-conteudo-tabela">{matriz?.cpf_cnpj || "-"}</td>
                        <td className="clientes-conteudo-tabela">
                            {classificacoes[grupo.id_classificacao_cliente]?.nome || "-"}
                        </td>
                        <td className="clientes-conteudo-tabela">{Formatadores.formatarMoeda(total)}</td>
                        <td className="clientes-conteudo-tabela">
                            {vendedores[matriz?.id_usuario] || "-"}
                        </td>
                        <td className="clientes-conteudo-tabela">
                            <FaUsers />
                        </td>
                    </tr>

                    {aberto &&
                        unidades.map((cliente) => (
                            <tr
                                key={cliente.id}
                                className="clientes-conteudo-tabela-hover"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/clientes/${cliente.id}`);
                                }}
                            >
                                <td className="clientes-conteudo-tabela">{cliente.nome_fantasia}</td>
                                <td className="clientes-conteudo-tabela">{cliente.cpf_cnpj}</td>
                                <td className="clientes-conteudo-tabela">
                                    {classificacoes[cliente.id_classificacao_cliente]?.nome || "-"}
                                </td>
                                <td className="clientes-conteudo-tabela">
                                    {Formatadores.formatarMoeda(funcoes.calcularValorTotalContratos(cliente.id))}
                                </td>
                                <td className="clientes-conteudo-tabela">
                                    {vendedores[cliente.id_usuario] || "-"}
                                </td>
                                <td className="clientes-conteudo-tabela">
                                    <FaUser />
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Fragment>
        );
    };

    const renderizarLinhaCliente = (item) => {
        const cliente = item.dados;
        return (
            <tbody key={`cliente-${cliente.id}`}>
                <tr
                    className="clientes-conteudo-tabela-sem-grupo"
                    onClick={() => navigate(`/clientes/${cliente.id}`)}
                >
                    <td className="clientes-conteudo-tabela">{cliente.nome_fantasia}</td>
                    <td className="clientes-conteudo-tabela">{cliente.cpf_cnpj}</td>
                    <td className="clientes-conteudo-tabela">
                        {classificacoes[cliente.id_classificacao_cliente]?.nome || "-"}
                    </td>
                    <td className="clientes-conteudo-tabela">
                        {Formatadores.formatarMoeda(funcoes.calcularValorTotalContratos(cliente.id))}
                    </td>
                    <td className="clientes-conteudo-tabela">
                        {vendedores[cliente.id_usuario] || "-"}
                    </td>
                    <td className="clientes-conteudo-tabela">
                        <FaUser />
                    </td>
                </tr>
            </tbody>
        );
    };

    if (itensCombinados.length === 0) {
        return <p id="clientes-sem-clientes">Nenhum cliente encontrado!</p>;
    }

    return (
        <table id="clientes-tabela">
            <thead>
                <tr>
                    <th className="clientes-titulo-tabela">Nome</th>
                    <th className="clientes-titulo-tabela">CPF/CNPJ</th>
                    <th className="clientes-titulo-tabela">Categoria</th>
                    <th className="clientes-titulo-tabela">Valor Contratos</th>
                    <th className="clientes-titulo-tabela">Vendedor</th>
                    <th className="clientes-titulo-tabela">Tipo</th>
                </tr>
            </thead>

            {itensPaginados.map((item) =>
                item.tipo === "grupo"
                    ? renderizarLinhaGrupo(item)
                    : renderizarLinhaCliente(item)
            )}

            <tfoot>
                {/* Paginação */}
                <tr>
                    <td colSpan="6" style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", alignItems: "center" }}>
                            <button
                                onClick={() => irParaPagina(paginaAtual - 1)}
                                disabled={paginaAtual === 1}
                                className="clientes-botao"
                            >
                                Anterior
                            </button>
                            <span>
                                Página {paginaAtual} de {totalPaginas}
                            </span>
                            <button
                                onClick={() => irParaPagina(paginaAtual + 1)}
                                disabled={paginaAtual >= totalPaginas}
                                className="clientes-botao"
                            >
                                Próxima
                            </button>
                        </div>
                    </td>
                </tr>

                {/* Totais Gerais */}
                <tr className="clientes-total-geral-linha">
                    <td className="clientes-total-label" colSpan={4}>
                        TOTAL DE CONTRATOS ATIVOS:
                    </td>
                    <td className="clientes-total-valor">
                        {Formatadores.formatarMoeda(totais.geral)}
                    </td>
                    <td />
                </tr>

                {/* Totais por Categoria */}
                {Object.entries(totais.porCategoria)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([categoria, valor]) => (
                        <tr key={categoria} className="clientes-total-categoria-linha">
                            <td className="clientes-total-label" colSpan={4}>
                                Total Categoria: {categoria}
                            </td>
                            <td className="clientes-total-valor">{Formatadores.formatarMoeda(valor)}</td>
                            <td />
                        </tr>
                    ))}
            </tfoot>
        </table>
    );
}
