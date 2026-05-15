const categoriaProdutoService = require('./categoria-produto.service');
const catchAsync = require('../../common/utils/catchAsync');

class CategoriaProdutoController {
    indexAll = catchAsync(async (req, res) => {
        const categorias = await categoriaProdutoService.getAllCategorias();
        return res.status(200).send({ categorias });
    });

    index = catchAsync(async (req, res) => {
        const { id } = req.params;
        const categoria = await categoriaProdutoService.getCategoriaById(id);
        return res.status(200).send({ categoria });
    });

    store = catchAsync(async (req, res) => {
        const { nome } = req.body;
        const categoria = await categoriaProdutoService.createCategoria({ nome });
        return res.status(201).send({
            message: 'Categoria criada com sucesso!',
            categoria,
        });
    });

    update = catchAsync(async (req, res) => {
        const { id } = req.params;
        const { nome, status } = req.body;
        await categoriaProdutoService.updateCategoria(id, { nome, status });
        return res.status(200).send({ message: 'Categoria atualizada com sucesso!' });
    });
}

module.exports = new CategoriaProdutoController();
