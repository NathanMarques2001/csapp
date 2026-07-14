const ProdutoService = require('./produto.service');
const catchAsync = require('../../utils/catchAsync');

class ProdutoController {
  index = catchAsync(async (req, res) => {
    const { id } = req.params;
    const produto = await ProdutoService.findById(id);
    return res.status(200).send({ produto });
  });

  indexAll = catchAsync(async (req, res) => {
    const produtos = await ProdutoService.findAll();
    return res.status(200).send({ produtos });
  });

  store = catchAsync(async (req, res) => {
    const { nome, id_fabricante, id_categoria_produto } = req.body;
    const produto = await ProdutoService.create({ nome, id_fabricante, id_categoria_produto });
    return res.status(201).send({
      message: 'Produto criado com sucesso!',
      produto,
    });
  });

  update = catchAsync(async (req, res) => {
    const { nome, id_fabricante, id_categoria_produto, status } = req.body;
    const { id } = req.params;
    await ProdutoService.update(id, { nome, id_fabricante, id_categoria_produto, status });
    return res.status(200).send({ message: 'Produto atualizado com sucesso!' });
  });
}

module.exports = new ProdutoController();
