const { Op } = require('sequelize');
const VencimentoContratos = require('../../models/VencimentoContratos');
const Contrato = require('../../models/Contrato');
const Cliente = require('../../models/Cliente');
const Usuario = require('../../models/Usuario');

class VencimentoContratoRepository {
  async findAll() {
    return await VencimentoContratos.findAll();
  }

  async findToday() {
    const today = new Date();
    const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));

    return await VencimentoContratos.findAll({
      where: {
        data_vencimento: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });
  }

  async getDadosEmail(id_contrato) {
    const contrato = await Contrato.findByPk(id_contrato);
    if (!contrato) return null;

    const cliente = await Cliente.findByPk(contrato.id_cliente);
    if (!cliente) return null;

    const usuario = await Usuario.findByPk(cliente.id_usuario);
    return { contrato, cliente, usuario };
  }

  async create(data) {
    return await VencimentoContratos.create(data);
  }

  async findById(id) {
    return await VencimentoContratos.findByPk(id);
  }

  async update(vencimento, data) {
    return await vencimento.update(data);
  }

  async delete(vencimento) {
    return await vencimento.destroy();
  }

  async findContratoById(id_contrato) {
    return await Contrato.findByPk(id_contrato);
  }
}

module.exports = new VencimentoContratoRepository();
