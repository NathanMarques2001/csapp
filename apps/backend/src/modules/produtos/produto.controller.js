const produtoService = require('./produto.service');
const catchAsync = require('../../common/utils/catchAsync');

class ProdutoController {
    indexAll = catchAsync(async (req, res) => {
        // page e limit já validados no req.query pelo Zod
        const { page, limit } = req.query;

        const result = await produtoService.getAllProdutos({ page, limit });

        return res.status(200).json({
            status: 'success',
            ...result
            // result contém { data: rows, meta: { total, page, limit, totalPages } }
        });
    });

    index = catchAsync(async (req, res) => {
        const { id } = req.params;

        const produto = await produtoService.getProdutoById(id);

        return res.status(200).json({
            status: 'success',
            data: { produto }
        });
    });

    store = catchAsync(async (req, res) => {
        const data = req.body;

        const produto = await produtoService.createProduto(data);

        return res.status(201).json({
            status: 'success',
            message: 'Produto criado com sucesso!',
            data: { produto }
        });
    });

    update = catchAsync(async (req, res) => {
        const { id } = req.params;
        const data = req.body;

        const produto = await produtoService.updateProduto(id, data);

        return res.status(200).json({
            status: 'success',
            message: 'Produto atualizado com sucesso!',
            data: { produto }
        });
    });
}

module.exports = new ProdutoController();
