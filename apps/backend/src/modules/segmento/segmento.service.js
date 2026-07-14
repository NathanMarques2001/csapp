const SegmentoRepository = require('./segmento.repository');
const AppError = require('../../utils/AppError');

class SegmentoService {
  async findById(id) {
    const segmento = await SegmentoRepository.findById(id);
    if (!segmento) {
      throw new AppError('Segmento não encontrado!', 404);
    }
    return segmento;
  }

  async findAll() {
    const segmentos = await SegmentoRepository.findAll();
    if (!segmentos || segmentos.length === 0) {
      throw new AppError('Nenhum segmento cadastrado!', 404);
    }
    return segmentos;
  }

  async create(data) {
    const segmento = await SegmentoRepository.create(data);
    return segmento;
  }

  async update(id, data) {
    // Validate if exists
    await this.findById(id);
    await SegmentoRepository.update(id, data);
    return true;
  }
}

module.exports = new SegmentoService();
