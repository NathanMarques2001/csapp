const ProdutoRepository = require('./produto.repository');
const AppError = require('../../utils/AppError');

class ProdutoService {
  async findById(id) {
    const produto = await ProdutoRepository.findById(id);
    if (!produto) {
      throw new AppError(`Nenhum produto cadastrado com id ${id}!`, 404);
    }
    return produto;
  }

  async findAll() {
    return await ProdutoRepository.findAll();
  }

  async create(data) {
    return await ProdutoRepository.create(data);
  }

  async update(id, data) {
    await this.findById(id);
    await ProdutoRepository.update(id, data);
    return true;
  }
}

module.exports = new ProdutoService();
