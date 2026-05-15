const segmentoRepository = require('./segmento.repository');
const AppError = require('../../common/exceptions/AppError');

class SegmentoService {
    async getAllSegmentos() {
        return await segmentoRepository.findAll();
    }

    async getSegmentoById(id) {
        const segmento = await segmentoRepository.findById(id);
        if (!segmento) {
            throw new AppError(`Nenhum segmento cadastrado com id ${id}!`, 404);
        }
        return segmento;
    }

    async createSegmento(data) {
        const existingSegmento = await segmentoRepository.findByNome(data.nome);
        if (existingSegmento) {
            throw new AppError('Segmento com este nome já existe.', 400);
        }

        return await segmentoRepository.create(data);
    }

    async updateSegmento(id, data) {
        const segmento = await segmentoRepository.findById(id);
        if (!segmento) {
            throw new AppError('Segmento não encontrado!', 404);
        }

        if (data.nome && data.nome !== segmento.nome) {
            const existingSegmento = await segmentoRepository.findByNome(data.nome);
            if (existingSegmento) {
                throw new AppError('Já existe um segmento com este nome.', 400);
            }
        }

        return await segmentoRepository.update(id, data);
    }
}

module.exports = new SegmentoService();
