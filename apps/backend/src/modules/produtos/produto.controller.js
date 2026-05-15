const produtoService = require('./produto.service');
const catchAsync = require('../../common/utils/catchAsync');

class ProdutoController {
    indexAll = catchAsync(async (req, res) => {
        const produtos = await produtoService.getAllProdutos();
        return res.status(200).send({ produtos });
    });

    index = catchAsync(async (req, res) => {
        const { id } = req.params;
        const produto = await produtoService.getProdutoById(id);
        return res.status(200).send({ produto });
    });

    store = catchAsync(async (req, res) => {
        const { nome, id_fabricante, id_categoria_produto } = req.body;
        const produto = await produtoService.createProduto({ nome, id_fabricante, id_categoria_produto });
        return res.status(201).send({
            message: 'Produto criado com sucesso!',
            produto,
        });
    });

    update = catchAsync(async (req, res) => {
        const { id } = req.params;
        const { nome, id_fabricante, id_categoria_produto, status } = req.body;
        const produto = await produtoService.updateProduto(id, { nome, id_fabricante, id_categoria_produto, status });
        return res.status(200).send({ message: 'Produto atualizado com sucesso!' });
    });
}

module.exports = new ProdutoController();
