const Faturado = require('../../models/Faturado');

class FaturadoRepository {
  async findById(id) {
    return await Faturado.findByPk(id);
  }

  async findAll() {
    return await Faturado.findAll({
      order: [['nome', 'ASC']],
    });
  }

  async create(data) {
    return await Faturado.create(data);
  }

  async update(id, data) {
    return await Faturado.update(data, { where: { id } });
  }
}

module.exports = new FaturadoRepository();
