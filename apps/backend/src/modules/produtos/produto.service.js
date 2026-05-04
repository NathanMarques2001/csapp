const produtoRepository = require('./produto.repository');
const AppError = require('../../common/exceptions/AppError');

class ProdutoService {
    async getAllProdutos({ page, limit }) {
        const result = await produtoRepository.findAllPaginated({ page, limit });

        // Como existia uma regra onde "se length == 0" retornava 404
        if (result.data.length === 0) {
            throw new AppError('Nenhum produto cadastrado!', 404);
        }

        return result;
    }

    async getProdutoById(id) {
        const produto = await produtoRepository.findById(id);
        if (!produto) {
            throw new AppError(`Nenhum produto cadastrado com id ${id}!`, 404);
        }
        return produto;
    }

    async createProduto(data) {
        // Validar se produto já existe com este nome (Exemplo de regra de negócio)
        const existingProduto = await produtoRepository.findByNome(data.nome);
        if (existingProduto) {
            throw new AppError('Produto com este nome já existe.', 400);
        }

        return await produtoRepository.create(data);
    }

    async updateProduto(id, data) {
        const produto = await produtoRepository.findById(id);
        if (!produto) {
            throw new AppError('Produto não encontrado!', 404);
        }

        // Se tiver tentando alterar o nome, verificar duplicidade.
        if (data.nome && data.nome !== produto.nome) {
            const existingProduto = await produtoRepository.findByNome(data.nome);
            if (existingProduto) {
                throw new AppError('Já existe um produto com este nome.', 400);
            }
        }

        return await produtoRepository.update(id, data);
    }
}

module.exports = new ProdutoService();
