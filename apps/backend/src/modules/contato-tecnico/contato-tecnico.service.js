const ContatoTecnicoRepository = require('./contato-tecnico.repository');
const AppError = require('../../utils/AppError');

class ContatoTecnicoService {
  async findAll() {
    return await ContatoTecnicoRepository.findAll();
  }

  async findById(id) {
    const contato = await ContatoTecnicoRepository.findById(id);
    if (!contato) {
      throw new AppError('Contato técnico não encontrado!', 404);
    }
    return contato;
  }

  async findByClienteId(id_cliente) {
    const cliente = await ContatoTecnicoRepository.findByClienteId(id_cliente);
    if (!cliente) {
      throw new AppError('Cliente não encontrado!', 404);
    }
    return cliente.contatos_tecnicos;
  }

  async create(data) {
    return await ContatoTecnicoRepository.create(data);
  }

  async update(id, data) {
    await this.findById(id);
    await ContatoTecnicoRepository.update(id, data);
    return true;
  }

  async delete(id) {
    await this.findById(id);
    await ContatoTecnicoRepository.delete(id);
    return true;
  }
}

module.exports = new ContatoTecnicoService();
