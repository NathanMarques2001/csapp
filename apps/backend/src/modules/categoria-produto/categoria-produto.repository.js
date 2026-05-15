const CategoriaProduto = require('../../models/CategoriaProduto');

class CategoriaProdutoRepository {
    async findAll() {
        return await CategoriaProduto.findAll({ order: [['nome', 'ASC']] });
    }

    async findById(id) {
        return await CategoriaProduto.findByPk(id);
    }

    async findByNome(nome) {
        return await CategoriaProduto.findOne({ where: { nome } });
    }

    async create(data) {
        return await CategoriaProduto.create(data);
    }

    async update(id, data) {
        await CategoriaProduto.update(data, { where: { id } });
        return this.findById(id);
    }
}

module.exports = new CategoriaProdutoRepository();
