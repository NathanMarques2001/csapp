const GrupoEconomico = require('../models/GrupoEconomico');

class GrupoEconomicoRepository {
  async findAll() {
    return await GrupoEconomico.findAll({
      order: [['nome', 'ASC']],
    });
  }

  async findById(id) {
    return await GrupoEconomico.findByPk(id);
  }

  async create(data) {
    return await GrupoEconomico.create(data);
  }

  async update(id, data) {
    return await GrupoEconomico.update(data, {
      where: { id },
    });
  }
}

module.exports = new GrupoEconomicoRepository();
