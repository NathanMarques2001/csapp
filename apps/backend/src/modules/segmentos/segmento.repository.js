const Segmento = require('../../../models/Segmento');

class SegmentoRepository {
    async findAllPaginated({ page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;

        const { count, rows } = await Segmento.findAndCountAll({
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
        return await Segmento.findByPk(id);
    }

    async findByNome(nome) {
        return await Segmento.findOne({ where: { nome } });
    }

    async create(data) {
        return await Segmento.create(data);
    }

    async update(id, data) {
        await Segmento.update(data, { where: { id } });
        return this.findById(id); // return updated record
    }
}

module.exports = new SegmentoRepository();
