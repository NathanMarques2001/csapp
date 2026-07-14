const { Op } = require('sequelize');
const HistoricoCliente = require('../../models/HistoricoCliente');
const HistoricoContrato = require('../../models/HistoricoContrato');
const HistoricoExecucao = require('../../models/HistoricoExecucao');
const Cliente = require('../../models/Cliente');
const Contrato = require('../../models/Contrato');

class HistoricoRepository {
  getSequelize() {
    return HistoricoCliente.sequelize;
  }

  async findExecucaoByData(data_referencia, status = null) {
    const where = { data_referencia };
    if (status) where.status = status;
    return await HistoricoExecucao.findOne({ where });
  }

  async createExecucao(data) {
    return await HistoricoExecucao.create(data);
  }

  async updateExecucao(execucao, data) {
    return await execucao.update(data);
  }

  async clearSnapshotData(data_referencia, transaction) {
    await HistoricoCliente.destroy({ where: { data_referencia }, transaction });
    await HistoricoContrato.destroy({ where: { data_referencia }, transaction });
  }

  async findAllClientes() {
    return await Cliente.findAll({ raw: true });
  }

  async bulkCreateHistoricoClientes(data, transaction) {
    return await HistoricoCliente.bulkCreate(data, { transaction });
  }

  async findAllContratos() {
    return await Contrato.findAll({ raw: true });
  }

  async bulkCreateHistoricoContratos(data, transaction) {
    return await HistoricoContrato.bulkCreate(data, { transaction });
  }

  async buscarHistoricoClientes(dataInicio, dataFim) {
    return await HistoricoCliente.findAll({
      where: {
        data_referencia: {
          [Op.between]: [dataInicio, dataFim],
        },
      },
      order: [['data_referencia', 'DESC']],
      include: ['vendedor', 'cliente_atual'],
    });
  }

  async buscarHistoricoContratos(dataInicio, dataFim) {
    return await HistoricoContrato.findAll({
      where: {
        data_referencia: {
          [Op.between]: [dataInicio, dataFim],
        },
      },
      order: [['data_referencia', 'DESC']],
    });
  }
}

module.exports = new HistoricoRepository();
