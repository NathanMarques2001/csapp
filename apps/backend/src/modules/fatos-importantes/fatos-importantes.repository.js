const FatosImportantes = require('../../models/FatosImportantes');
const Cliente = require('../../models/Cliente');

class FatosImportantesRepository {
  async findAll() {
    return await FatosImportantes.findAll();
  }

  async findById(id) {
    return await FatosImportantes.findByPk(id);
  }

  async findByClienteId(id_cliente) {
    return await Cliente.findByPk(id_cliente, {
      include: { association: 'fatos_importantes' },
    });
  }

  async create(data) {
    return await FatosImportantes.create(data);
  }

  async update(id, data) {
    return await FatosImportantes.update(data, { where: { id } });
  }

  async delete(id) {
    return await FatosImportantes.destroy({ where: { id } });
  }
}

module.exports = new FatosImportantesRepository();
