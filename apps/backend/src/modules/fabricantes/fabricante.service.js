const fabricanteRepository = require('./fabricante.repository');
const AppError = require('../../common/exceptions/AppError');

class FabricanteService {
    async getAllFabricantes({ page, limit }) {
        const result = await fabricanteRepository.findAllPaginated({ page, limit });

        if (result.data.length === 0) {
            throw new AppError('Nenhum fabricante cadastrado!', 404);
        }

        return result;
    }

    async getFabricanteById(id) {
        const fabricante = await fabricanteRepository.findById(id);
        if (!fabricante) {
            throw new AppError(`Nenhum fabricante cadastrado com id ${id}!`, 404);
        }
        return fabricante;
    }

    async createFabricante(data) {
        const existingFabricante = await fabricanteRepository.findByNome(data.nome);
        if (existingFabricante) {
            throw new AppError('Fabricante com este nome já existe.', 400);
        }

        return await fabricanteRepository.create(data);
    }

    async updateFabricante(id, data) {
        const fabricante = await fabricanteRepository.findById(id);
        if (!fabricante) {
            throw new AppError('Fabricante não encontrado!', 404);
        }

        if (data.nome && data.nome !== fabricante.nome) {
            const existingFabricante = await fabricanteRepository.findByNome(data.nome);
            if (existingFabricante) {
                throw new AppError('Já existe um fabricante com este nome.', 400);
            }
        }

        return await fabricanteRepository.update(id, data);
    }
}

module.exports = new FabricanteService();
