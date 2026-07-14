const Fabricante = require('../../models/Fabricante');

class FabricanteRepository {
  async findById(id) {
    return await Fabricante.findByPk(id);
  }

  async findAll() {
    return await Fabricante.findAll({
      order: [['nome', 'ASC']],
    });
  }

  async create(data) {
    return await Fabricante.create(data);
  }

  async update(id, data) {
    return await Fabricante.update(data, { where: { id } });
  }
}

module.exports = new FabricanteRepository();
