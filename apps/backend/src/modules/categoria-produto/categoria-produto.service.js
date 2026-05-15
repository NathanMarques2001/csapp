const categoriaProdutoRepository = require('./categoria-produto.repository');
const AppError = require('../../common/exceptions/AppError');

class CategoriaProdutoService {
    async getAllCategorias() {
        return await categoriaProdutoRepository.findAll();
    }

    async getCategoriaById(id) {
        const categoria = await categoriaProdutoRepository.findById(id);
        if (!categoria) {
            throw new AppError(`Nenhuma categoria cadastrada com id ${id}!`, 404);
        }
        return categoria;
    }

    async createCategoria(data) {
        const existing = await categoriaProdutoRepository.findByNome(data.nome);
        if (existing) {
            throw new AppError('Categoria com este nome já existe.', 400);
        }
        return await categoriaProdutoRepository.create(data);
    }

    async updateCategoria(id, data) {
        const categoria = await categoriaProdutoRepository.findById(id);
        if (!categoria) {
            throw new AppError('Categoria não encontrada!', 404);
        }
        if (data.nome && data.nome !== categoria.nome) {
            const existing = await categoriaProdutoRepository.findByNome(data.nome);
            if (existing) {
                throw new AppError('Já existe uma categoria com este nome.', 400);
            }
        }
        return await categoriaProdutoRepository.update(id, data);
    }
}

module.exports = new CategoriaProdutoService();
