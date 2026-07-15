const Cliente = require('../models/Cliente');

class ClienteRepository {
  async findByGrupoEconomicoId(grupoEconomicoId) {
    return await Cliente.findAll({ where: { id_grupo_economico: grupoEconomicoId } });
  }

  async updateStatus(id, status) {
    return await Cliente.update({ status }, { where: { id } });
  }
}

module.exports = new ClienteRepository();
