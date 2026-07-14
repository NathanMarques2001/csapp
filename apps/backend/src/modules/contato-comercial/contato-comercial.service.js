const ContatoComercialRepository = require('./contato-comercial.repository');
const AppError = require('../../utils/AppError');

class ContatoComercialService {
  async findAll() {
    return await ContatoComercialRepository.findAll();
  }

  async findById(id) {
    const contato = await ContatoComercialRepository.findById(id);
    if (!contato) {
      throw new AppError('Contato comercial não encontrado!', 404);
    }
    return contato;
  }

  async findByClienteId(id_cliente) {
    const cliente = await ContatoComercialRepository.findByClienteId(id_cliente);
    if (!cliente) {
      throw new AppError('Cliente não encontrado!', 404);
    }
    return cliente.contatos_comerciais;
  }

  async create(data) {
    const { id_cliente, conteudo } = data;
    if (!conteudo) {
      throw new AppError('O campo conteúdo é obrigatório!', 400);
    }
    if (!id_cliente) {
      throw new AppError('O campo id_cliente é obrigatório!', 400);
    }

    return await ContatoComercialRepository.create(data);
  }

  async update(id, data) {
    const { conteudo } = data;
    await this.findById(id); // validates existence
    
    if (!conteudo) {
      throw new AppError('O campo conteúdo é obrigatório!', 400);
    }

    // Await was missing originally
    await ContatoComercialRepository.update(id, data);
    return true;
  }

  async delete(id) {
    await this.findById(id); // validates existence
    // Await was missing originally
    await ContatoComercialRepository.delete(id);
    return true;
  }
}

module.exports = new ContatoComercialService();
