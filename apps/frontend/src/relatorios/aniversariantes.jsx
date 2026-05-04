import { useState, useMemo } from "react";
import Excel from "../utils/excel";
import Popup from "../componentes/pop-up";

export default function RelatorioAniversariantes({ clientes }) {
    const meses = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
    ];

    const hoje = new Date();
    const [mesSelecionado, setMesSelecionado] = useState(String(hoje.getMonth() + 1));
    const [abrirPopup, setAbrirPopup] = useState(false);

    // Normaliza e extrai dia/mes de uma string 'YYYY-MM-DD' ou similar.
    const extrairDiaMes = (dataStr) => {
        if (!dataStr) return null;
        // aceita formatos como 'YYYY-MM-DD' ou 'YYYY-MM-DDT...'
        const partes = dataStr.split("-");
        if (partes.length < 3) return null;
        const ano = partes[0];
        const mes = partes[1];
        const dia = partes[2].slice(0, 2);
        if (!/^[0-9]{2}$/.test(dia) || !/^[0-9]{2}$/.test(mes)) return null;
        return { dia, mes };
    };

    // Gera linhas: uma linha por pessoa (gestor) cujo mês bate com o selecionado
    const aniversariantes = useMemo(() => {
        if (!clientes || clientes.length === 0) return [];
        const linhas = [];
        clientes.forEach((c) => {
            const clienteNome = c.nome_fantasia || c.razao_social || "—";
            const cpfCnpj = c.cpf_cnpj || "";

            const campos = [
                {
                    dataCampo: c.gestor_contratos_nascimento,
                    nome: c.gestor_contratos_nome,
                    cargo: "Gestor Contratos",
                },
                {
                    dataCampo: c.gestor_chamados_nascimento,
                    nome: c.gestor_chamados_nome,
                    cargo: "Gestor Chamados",
                },
                {
                    dataCampo: c.gestor_financeiro_nascimento,
                    nome: c.gestor_financeiro_nome,
                    cargo: "Gestor Financeiro",
                },
            ];

            campos.forEach((item) => {
                const dm = extrairDiaMes(item.dataCampo);
                if (!dm) return;
                // comparar mês (numérico sem zeros à esquerda)
                if (String(Number(dm.mes)) === String(Number(mesSelecionado))) {
                    linhas.push({
                        Cliente: clienteNome,
                        "CPF/CNPJ": cpfCnpj,
                        Pessoa: item.nome || "—",
                        Cargo: item.cargo,
                        "Data Aniversário": `${dm.dia}/${dm.mes}`,
                    });
                }
            });
        });
        // deduplicate rows that may repeat because same person appears in multiple cargos
        const unicos = [];
        const vistos = new Set();
        linhas.forEach((r) => {
            const clienteKey = (r["Cliente"] || "").toString().trim();
            const cpfKey = (r["CPF/CNPJ"] || "").toString().replace(/\s+/g, "").trim();
            const pessoaKey = (r["Pessoa"] || "").toString().trim();
            const dataKey = (r["Data Aniversário"] || "").toString().trim();
            const key = `${clienteKey}|${cpfKey}|${pessoaKey}|${dataKey}`;
            if (!vistos.has(key)) {
                vistos.add(key);
                // normalize trimmed fields
                unicos.push({
                    Cliente: clienteKey,
                    "CPF/CNPJ": cpfKey,
                    Pessoa: pessoaKey,
                    Cargo: r["Cargo"],
                    "Data Aniversário": dataKey,
                });
            }
        });

        // ordenar por dia
        unicos.sort((a, b) => {
            const da = Number(a["Data Aniversário"].split("/")[0]);
            const db = Number(b["Data Aniversário"].split("/")[0]);
            return da - db;
        });
        return unicos;
    }, [clientes, mesSelecionado]);

    const excel = new Excel(`Relatório Aniversariantes - ${meses[Number(mesSelecionado) - 1]}`);

    const baixarRelatorio = (e) => {
        e.preventDefault();
        excel.exportToExcel(aniversariantes);
        setAbrirPopup(false);
    };

    return (
        <>
            {abrirPopup && (
                <Popup
                    title={`Exportar aniversariantes - ${meses[Number(mesSelecionado) - 1]}`}
                    message={`Deseja exportar os aniversariantes de ${meses[Number(mesSelecionado) - 1]}?`}
                    onConfirm={baixarRelatorio}
                    onCancel={() => setAbrirPopup(false)}
                />
            )}

            <select
                id="select-tabela-relatorios"
                style={{ marginLeft: "4%" }}
                value={mesSelecionado}
                onChange={(e) => setMesSelecionado(e.target.value)}
            >
                {meses.map((m, i) => (
                    <option key={i} value={String(i + 1)}>
                        {m}
                    </option>
                ))}
            </select>

            <button className="relatorio-button"
                id="relatorio-button-exportar" onClick={() => setAbrirPopup(true)}>
                Exportar para Excel
            </button>

            <table className="global-tabela">
                <thead>
                    <tr>
                        <th className="global-titulo-tabela">Cliente</th>
                        <th className="global-titulo-tabela">CPF/CNPJ</th>
                        <th className="global-titulo-tabela">Pessoa</th>
                        <th className="global-titulo-tabela">Cargo</th>
                        <th className="global-titulo-tabela">Data Aniversário</th>
                    </tr>
                </thead>
                <tbody>
                    {aniversariantes.map((linha, i) => (
                        <tr key={i}>
                            <td className="global-conteudo-tabela">{linha["Cliente"]}</td>
                            <td className="global-conteudo-tabela">{linha["CPF/CNPJ"]}</td>
                            <td className="global-conteudo-tabela">{linha["Pessoa"]}</td>
                            <td className="global-conteudo-tabela">{linha["Cargo"]}</td>
                            <td className="global-conteudo-tabela">{linha["Data Aniversário"]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
