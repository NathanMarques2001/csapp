const { Op } = require('sequelize');
const ClassificacaoCliente = require('../../models/ClassificacaoCliente');

class ClassificacaoClienteRepository {
  async findAllQuantidade() {
    return await ClassificacaoCliente.findAll({
      where: { tipo_categoria: 'quantidade' },
      order: [['nome', 'ASC']],
    });
  }

  async findAllValor() {
    return await ClassificacaoCliente.findAll({
      where: { tipo_categoria: 'valor' },
      order: [['valor', 'DESC']],
    });
  }

  async findById(id) {
    return await ClassificacaoCliente.findByPk(id);
  }

  async findQuantidade(excludeId = null) {
    const where = { tipo_categoria: 'quantidade' };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    return await ClassificacaoCliente.findOne({ where });
  }

  async create(data) {
    return await ClassificacaoCliente.create(data);
  }

  async update(classificacao, data) {
    return await classificacao.update(data);
  }
}

module.exports = new ClassificacaoClienteRepository();
