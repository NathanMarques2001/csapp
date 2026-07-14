const Produto = require('../../models/Produto');

class ProdutoRepository {
  async findById(id) {
    return await Produto.findByPk(id);
  }

  async findAll() {
    return await Produto.findAll({
      order: [['nome', 'ASC']],
    });
  }

  async create(data) {
    return await Produto.create(data);
  }

  async update(id, data) {
    return await Produto.update(data, { where: { id } });
  }
}

module.exports = new ProdutoRepository();
