const HistoricoCliente = require("../models/HistoricoCliente");
const HistoricoContrato = require("../models/HistoricoContrato");
const HistoricoExecucao = require("../models/HistoricoExecucao");
const Cliente = require("../models/Cliente");
const Contrato = require("../models/Contrato");
const { Op } = require("sequelize");
const Database = require("../database"); // Acesso à conexão para transaction

class HistoricoService {
    async gerarSnapshotDiario() {
        const connection = require("../database").connection; // Hack para pegar a instancia do sequelize se nao exportada diretamente
        // Mas o ideal é que database/index exporte a conexão.
        // Vamos checar como database/index.js exporta.
        // Assumindo que exporta 'connection' ou que podemos pegar de um model.

        const sequelize = HistoricoCliente.sequelize;
        const hoje = new Date().toISOString().split("T")[0];

        // 1. Verificação preliminar de duplicidade
        const jaRodou = await HistoricoExecucao.findOne({
            where: { data_referencia: hoje, status: 'SUCESSO' },
        });

        if (jaRodou) {
            console.log(`[HistoricoService] Snapshot para ${hoje} já realizado com sucesso.`);
            return;
        }

        // 2. Criar registro de execução
        let execucao;
        try {
            // Tenta criar ou recuperar se estava em erro/andamento
            execucao = await HistoricoExecucao.findOne({ where: { data_referencia: hoje } });
            if (!execucao) {
                execucao = await HistoricoExecucao.create({
                    data_referencia: hoje,
                    data_inicio_execucao: new Date(),
                    status: 'EM_EXECUCAO'
                });
            } else {
                await execucao.update({
                    data_inicio_execucao: new Date(),
                    status: 'EM_EXECUCAO',
                    mensagem_erro: null
                });
            }
        } catch (err) {
            console.error("[HistoricoService] Erro ao iniciar registro de execução:", err);
            return; // Se não consegue registrar inicio, aborta para não gerar inconsistencia invisivel
        }

        const t = await sequelize.transaction();

        try {
            console.log(`[HistoricoService] Iniciando snapshot para ${hoje}...`);

            // Limpeza prévia para garantir idempotência dentro da transação (caso retry)
            await HistoricoCliente.destroy({ where: { data_referencia: hoje }, transaction: t });
            await HistoricoContrato.destroy({ where: { data_referencia: hoje }, transaction: t });

            // 3. Snapshot de Clientes
            const clientes = await Cliente.findAll({ raw: true });
            const historicoClientes = clientes.map((c) => ({
                data_referencia: hoje,
                id_cliente_original: c.id,
                razao_social: c.razao_social,
                nome_fantasia: c.nome_fantasia,
                cpf_cnpj: c.cpf_cnpj,
                id_usuario: c.id_usuario,
                nps: c.nps === "" ? null : c.nps,
                id_segmento: c.id_segmento,
                status: c.status,
                id_classificacao_cliente: c.id_classificacao_cliente,
                data_criacao: c.data_criacao,
                valor_total_contratos: 0,
            }));

            // Bulk Insert em lotes para performance e evitar estourar memória
            const batchSize = 500;
            for (let i = 0; i < historicoClientes.length; i += batchSize) {
                await HistoricoCliente.bulkCreate(historicoClientes.slice(i, i + batchSize), { transaction: t });
            }
            console.log(`[HistoricoService] ${historicoClientes.length} clientes arquivados.`);

            // 4. Snapshot de Contratos
            const contratos = await Contrato.findAll({ raw: true });
            const historicoContratos = contratos.map((c) => ({
                data_referencia: hoje,
                id_contrato_original: c.id,
                id_cliente: c.id_cliente,
                id_produto: c.id_produto,
                id_faturado: c.id_faturado,
                status: c.status,
                valor_mensal: c.valor_mensal,
                quantidade: c.quantidade,
                data_inicio: c.data_inicio,
                data_vencimento_calculada: null,
            }));

            for (let i = 0; i < historicoContratos.length; i += batchSize) {
                await HistoricoContrato.bulkCreate(historicoContratos.slice(i, i + batchSize), { transaction: t });
            }
            console.log(`[HistoricoService] ${historicoContratos.length} contratos arquivados.`);

            // Commit da Transação
            await t.commit();

            // Atualiza status de SUCESSO
            await execucao.update({
                data_fim_execucao: new Date(),
                status: 'SUCESSO',
                quantidade_clientes: historicoClientes.length,
                quantidade_contratos: historicoContratos.length
            });

            console.log(`[HistoricoService] Snapshot concluído com sucesso.`);

        } catch (error) {
            // Rollback em caso de erro
            await t.rollback();
            console.error("[HistoricoService] Erro fatal no snapshot. Rollback executado.", error);

            // Registra erro
            await execucao.update({
                data_fim_execucao: new Date(),
                status: 'ERRO',
                mensagem_erro: error.message
            });
        }
    }

    async buscarHistoricoClientes(dataInicio, dataFim) {
        return await HistoricoCliente.findAll({
            where: {
                data_referencia: {
                    [Op.between]: [dataInicio, dataFim],
                },
            },
            order: [["data_referencia", "DESC"]],
            include: ["vendedor", "cliente_atual"],
        });
    }

    async buscarHistoricoContratos(dataInicio, dataFim) {
        return await HistoricoContrato.findAll({
            where: {
                data_referencia: {
                    [Op.between]: [dataInicio, dataFim],
                },
            },
            order: [["data_referencia", "DESC"]],
        });
    }
}

module.exports = new HistoricoService();
