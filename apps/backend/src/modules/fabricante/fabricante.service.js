const FabricanteRepository = require('./fabricante.repository');
const AppError = require('../../utils/AppError');

class FabricanteService {
  async findById(id) {
    const fabricante = await FabricanteRepository.findById(id);
    if (!fabricante) {
      throw new AppError('Fabricante não encontrado!', 404);
    }
    return fabricante;
  }

  async findAll() {
    const fabricantes = await FabricanteRepository.findAll();
    return fabricantes;
  }

  async create(data) {
    const fabricante = await FabricanteRepository.create(data);
    return fabricante;
  }

  async update(id, data) {
    await this.findById(id);
    await FabricanteRepository.update(id, data);
    return true;
  }
}

module.exports = new FabricanteService();
