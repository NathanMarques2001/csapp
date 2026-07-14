const GrupoEconomico = require('../../models/GrupoEconomico');
const Cliente = require('../../models/Cliente');
const Contrato = require('../../models/Contrato');

class GrupoEconomicoRepository {
  async findAll() {
    return await GrupoEconomico.findAll({
      order: [['nome', 'ASC']],
    });
  }

  async findById(id) {
    return await GrupoEconomico.findByPk(id);
  }

  async findClientesByGrupoId(id_grupo_economico) {
    return await Cliente.findAll({
      where: { id_grupo_economico },
    });
  }

  async create(data) {
    return await GrupoEconomico.create(data);
  }

  async updateStatus(id, status) {
    return await GrupoEconomico.update({ status }, { where: { id } });
  }

  async update(id, data) {
    return await GrupoEconomico.update(data, { where: { id } });
  }

  async inativarClienteEContratos(cliente_id) {
    await Cliente.update({ status: 'inativo' }, { where: { id: cliente_id } });
    await Contrato.update({ status: 'inativo' }, { where: { id_cliente: cliente_id } });
  }
}

module.exports = new GrupoEconomicoRepository();
