const Segmento = require('../../models/Segmento');

class SegmentoRepository {
  async findById(id) {
    return await Segmento.findByPk(id);
  }

  async findAll() {
    return await Segmento.findAll({
      order: [['nome', 'ASC']],
    });
  }

  async create(data) {
    return await Segmento.create(data);
  }

  async update(id, data) {
    return await Segmento.update(data, { where: { id } });
  }

  // async delete(id) {
  //   return await Segmento.destroy({ where: { id } });
  // }
}

module.exports = new SegmentoRepository();
