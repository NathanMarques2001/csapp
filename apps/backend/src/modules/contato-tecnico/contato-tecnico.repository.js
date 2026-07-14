const ContatoTecnico = require('../../models/ContatoTecnico');
const Cliente = require('../../models/Cliente');

class ContatoTecnicoRepository {
  async findAll() {
    return await ContatoTecnico.findAll();
  }

  async findById(id) {
    return await ContatoTecnico.findByPk(id);
  }

  async findByClienteId(id_cliente) {
    return await Cliente.findByPk(id_cliente, {
      include: { association: 'contatos_tecnicos' },
    });
  }

  async create(data) {
    return await ContatoTecnico.create(data);
  }

  async update(id, data) {
    return await ContatoTecnico.update(data, { where: { id } });
  }

  async delete(id) {
    return await ContatoTecnico.destroy({ where: { id } });
  }
}

module.exports = new ContatoTecnicoRepository();
