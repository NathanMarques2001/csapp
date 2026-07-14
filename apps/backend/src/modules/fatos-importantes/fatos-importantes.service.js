const FatosImportantesRepository = require('./fatos-importantes.repository');
const AppError = require('../../utils/AppError');

class FatosImportantesService {
  async findAll() {
    return await FatosImportantesRepository.findAll();
  }

  async findById(id) {
    const fato = await FatosImportantesRepository.findById(id);
    if (!fato) {
      throw new AppError('Fato importante não encontrado!', 404);
    }
    return fato;
  }

  async findByClienteId(id_cliente) {
    const cliente = await FatosImportantesRepository.findByClienteId(id_cliente);
    if (!cliente) {
      throw new AppError('Cliente não encontrado!', 404);
    }
    return cliente.fatos_importantes;
  }

  async create(data) {
    const { id_cliente, conteudo } = data;
    if (!conteudo) {
      throw new AppError('O campo conteúdo é obrigatório!', 400);
    }
    if (!id_cliente) {
      throw new AppError('O campo id_cliente é obrigatório!', 400);
    }

    return await FatosImportantesRepository.create(data);
  }

  async update(id, data) {
    const { conteudo } = data;
    await this.findById(id);
    if (!conteudo) {
      throw new AppError('O campo conteúdo é obrigatório!', 400);
    }

    await FatosImportantesRepository.update(id, data);
    return true;
  }

  async delete(id) {
    await this.findById(id);
    await FatosImportantesRepository.delete(id);
    return true;
  }
}

module.exports = new FatosImportantesService();
