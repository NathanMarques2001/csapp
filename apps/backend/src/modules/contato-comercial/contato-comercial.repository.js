const ContatoComercial = require('../../models/ContatoComercial');
const Cliente = require('../../models/Cliente');

class ContatoComercialRepository {
  async findAll() {
    return await ContatoComercial.findAll();
  }

  async findById(id) {
    return await ContatoComercial.findByPk(id);
  }

  async findByClienteId(id_cliente) {
    return await Cliente.findByPk(id_cliente, {
      include: { association: 'contatos_comerciais' },
    });
  }

  async create(data) {
    return await ContatoComercial.create(data);
  }

  async update(id, data) {
    return await ContatoComercial.update(data, { where: { id } });
  }

  async delete(id) {
    return await ContatoComercial.destroy({ where: { id } });
  }
}

module.exports = new ContatoComercialRepository();
