const HistoricoRepository = require('./historico.repository');
const AppError = require('../../utils/AppError');

class HistoricoService {
  async gerarSnapshotDiario() {
    const sequelize = HistoricoRepository.getSequelize();
    const hoje = new Date().toISOString().split('T')[0];

    // 1. Verificação preliminar de duplicidade
    const jaRodou = await HistoricoRepository.findExecucaoByData(hoje, 'SUCESSO');
    if (jaRodou) {
      console.log(`[HistoricoService] Snapshot para ${hoje} já realizado com sucesso.`);
      return;
    }

    // 2. Criar registro de execução
    let execucao;
    try {
      execucao = await HistoricoRepository.findExecucaoByData(hoje);
      if (!execucao) {
        execucao = await HistoricoRepository.createExecucao({
          data_referencia: hoje,
          data_inicio_execucao: new Date(),
          status: 'EM_EXECUCAO',
        });
      } else {
        await HistoricoRepository.updateExecucao(execucao, {
          data_inicio_execucao: new Date(),
          status: 'EM_EXECUCAO',
          mensagem_erro: null,
        });
      }
    } catch (err) {
      console.error('[HistoricoService] Erro ao iniciar registro de execução:', err);
      return;
    }

    const t = await sequelize.transaction();

    try {
      console.log(`[HistoricoService] Iniciando snapshot para ${hoje}...`);

      await HistoricoRepository.clearSnapshotData(hoje, t);

      // 3. Snapshot de Clientes
      const clientes = await HistoricoRepository.findAllClientes();
      const historicoClientes = clientes.map((c) => ({
        data_referencia: hoje,
        id_cliente_original: c.id,
        razao_social: c.razao_social,
        nome_fantasia: c.nome_fantasia,
        cpf_cnpj: c.cpf_cnpj,
        id_usuario: c.id_usuario,
        nps: c.nps === '' ? null : c.nps,
        id_segmento: c.id_segmento,
        status: c.status,
        id_classificacao_cliente: c.id_classificacao_cliente,
        data_criacao: c.data_criacao,
        valor_total_contratos: 0,
      }));

      const batchSize = 500;
      for (let i = 0; i < historicoClientes.length; i += batchSize) {
        await HistoricoRepository.bulkCreateHistoricoClientes(historicoClientes.slice(i, i + batchSize), t);
      }
      console.log(`[HistoricoService] ${historicoClientes.length} clientes arquivados.`);

      // 4. Snapshot de Contratos
      const contratos = await HistoricoRepository.findAllContratos();
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
        await HistoricoRepository.bulkCreateHistoricoContratos(historicoContratos.slice(i, i + batchSize), t);
      }
      console.log(`[HistoricoService] ${historicoContratos.length} contratos arquivados.`);

      await t.commit();

      await HistoricoRepository.updateExecucao(execucao, {
        data_fim_execucao: new Date(),
        status: 'SUCESSO',
        quantidade_clientes: historicoClientes.length,
        quantidade_contratos: historicoContratos.length,
      });

      console.log(`[HistoricoService] Snapshot concluído com sucesso.`);
    } catch (error) {
      await t.rollback();
      console.error('[HistoricoService] Erro fatal no snapshot. Rollback executado.', error);

      await HistoricoRepository.updateExecucao(execucao, {
        data_fim_execucao: new Date(),
        status: 'ERRO',
        mensagem_erro: error.message,
      });
    }
  }

  async buscarHistoricoClientes(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) {
      throw new AppError('Data de início e fim são obrigatórias.', 400);
    }
    return await HistoricoRepository.buscarHistoricoClientes(dataInicio, dataFim);
  }

  async buscarHistoricoContratos(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) {
      throw new AppError('Data de início e fim são obrigatórias.', 400);
    }
    return await HistoricoRepository.buscarHistoricoContratos(dataInicio, dataFim);
  }
}

module.exports = new HistoricoService();
