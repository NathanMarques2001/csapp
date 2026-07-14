const FaturadoRepository = require('./faturado.repository');
const AppError = require('../../utils/AppError');

class FaturadoService {
  async findById(id) {
    const faturado = await FaturadoRepository.findById(id);
    if (!faturado) {
      throw new AppError('Faturado não encontrado!', 404);
    }
    return faturado;
  }

  async findAll() {
    const faturados = await FaturadoRepository.findAll();
    if (!faturados || faturados.length === 0) {
        throw new AppError('Nenhum faturado cadastrado!', 404);
    }
    return faturados;
  }

  async create(data) {
    return await FaturadoRepository.create(data);
  }

  async update(id, data) {
    await this.findById(id);
    await FaturadoRepository.update(id, data);
    return true;
  }
}

module.exports = new FaturadoService();
