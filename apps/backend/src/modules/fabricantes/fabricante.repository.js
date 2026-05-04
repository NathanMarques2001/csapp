const Fabricante = require('../../../models/Fabricante');

class FabricanteRepository {
    async findAllPaginated({ page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;

        const { count, rows } = await Fabricante.findAndCountAll({
            order: [['nome', 'ASC']],
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
        });

        return {
            data: rows,
            meta: {
                total: count,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalPages: Math.ceil(count / limit) || 1
            }
        };
    }

    async findById(id) {
        return await Fabricante.findByPk(id);
    }

    async findByNome(nome) {
        return await Fabricante.findOne({ where: { nome } });
    }

    async create(data) {
        return await Fabricante.create(data);
    }

    async update(id, data) {
        await Fabricante.update(data, { where: { id } });
        return this.findById(id); // return updated record
    }
}

module.exports = new FabricanteRepository();
