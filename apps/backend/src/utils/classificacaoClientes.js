const Contrato = require("../models/Contrato");
const Cliente = require("../models/Cliente");
const GrupoEconomico = require("../models/GrupoEconomico");
const ClassificacaoClientes = require("../models/ClassificacaoCliente");

function calcularValorComReajuste(valor, taxa) {
    return valor + (valor * taxa) / 100;
}

async function classificarClientes() {
    try {
        console.log("[classificarClientes] Iniciando classificação...");

        // 1. Buscar todos os dados necessários
        const [gruposEconomicos, clientes, contratosAtivos, classificacoes] =
            await Promise.all([
                GrupoEconomico.findAll(),
                Cliente.findAll(),
                Contrato.findAll({ where: { status: "ativo" } }),
                ClassificacaoClientes.findAll({
                    where: { status: "ativo" },
                    order: [["valor", "DESC"]],
                }),
            ]);

        // 2. Agrupar contratos por cliente
        const contratosPorCliente = contratosAtivos.reduce((mapa, contrato) => {
            if (!mapa[contrato.id_cliente]) mapa[contrato.id_cliente] = [];
            mapa[contrato.id_cliente].push(contrato);
            return mapa;
        }, {});

        // 3. Calcular faturamento mensal por cliente (com reajuste e tipo de faturamento)
        const faturamentoPorCliente = {};
        for (const cliente of clientes) {
            const contratosCliente = contratosPorCliente[cliente.id] || [];
            let faturamentoCliente = 0;

            for (const contrato of contratosCliente) {
                const bruto = parseFloat(contrato.valor_mensal);
                let indiceReajuste = parseFloat(contrato.indice_reajuste);
                const tipo = contrato.tipo_faturamento;

                if (isNaN(bruto)) continue;
                if (isNaN(indiceReajuste)) indiceReajuste = 0;

                const valorMensal = tipo === "anual" ? bruto / 12 : bruto;
                const valorFinal = calcularValorComReajuste(valorMensal, indiceReajuste);

                faturamentoCliente += valorFinal;
            }

            faturamentoPorCliente[cliente.id] = faturamentoCliente;
        }

        // 4. Calcular faturamento por grupo econômico (somando o de seus clientes)
        const faturamentoPorGrupo = {};
        for (const cliente of clientes) {
            if (cliente.id_grupo_economico) {
                faturamentoPorGrupo[cliente.id_grupo_economico] =
                    (faturamentoPorGrupo[cliente.id_grupo_economico] || 0) +
                    (faturamentoPorCliente[cliente.id] || 0);
            }
        }

        // 5. Montar lista combinada de entidades para classificação
        const faturamentos = [];

        for (const grupo of gruposEconomicos) {
            faturamentos.push({
                id: grupo.id,
                tipoEntidade: "grupo",
                faturamentoTotal: faturamentoPorGrupo[grupo.id] || 0,
            });
        }

        for (const cliente of clientes.filter((c) => !c.id_grupo_economico)) {
            faturamentos.push({
                id: cliente.id,
                tipoEntidade: "cliente",
                faturamentoTotal: faturamentoPorCliente[cliente.id] || 0,
            });
        }

        // 6. Ordenar todas entidades do maior para o menor faturamento
        faturamentos.sort((a, b) => b.faturamentoTotal - a.faturamentoTotal);

        // 7. Aplicar classificações baseadas em quantidade e valor
        let indice = 0;
        for (const classificacao of classificacoes) {
            // Classificação por quantidade (ex: top 10)
            if (classificacao.quantidade) {
                for (
                    let i = 0;
                    i < classificacao.quantidade && indice < faturamentos.length;
                    i++
                ) {
                    const entidade = faturamentos[indice];

                    if (entidade.tipoEntidade === "grupo") {
                        await GrupoEconomico.update(
                            { id_classificacao_cliente: classificacao.id },
                            { where: { id: entidade.id } },
                        );
                    } else {
                        await Cliente.update(
                            { id_classificacao_cliente: classificacao.id },
                            { where: { id: entidade.id } },
                        );
                    }

                    indice++;
                }
            }
        }

        // 8. Aplicar classificações por valor (ex: acima de 5k, acima de 3k, etc)
        for (; indice < faturamentos.length; indice++) {
            const entidade = faturamentos[indice];
            const { faturamentoTotal } = entidade;

            // Encontrar a primeira classificação com valor compatível
            const classificacaoValor = classificacoes.find(
                (c) => c.valor && faturamentoTotal >= c.valor,
            );

            const idClassificacao = classificacaoValor
                ? classificacaoValor.id
                : classificacoes.find((c) => !c.valor && !c.quantidade)?.id;

            if (!idClassificacao) continue;

            if (entidade.tipoEntidade === "grupo") {
                await GrupoEconomico.update(
                    { id_classificacao_cliente: idClassificacao },
                    { where: { id: entidade.id } },
                );
            } else {
                await Cliente.update(
                    { id_classificacao_cliente: idClassificacao },
                    { where: { id: entidade.id } },
                );
            }
        }

        console.log("[classificarClientes] Classificação finalizada.");
    } catch (error) {
        console.error("[classificarClientes] Erro na classificação:", error);
    }
}

module.exports = classificarClientes;
