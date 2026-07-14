const ClassificacaoClienteService = require('./classificacao-cliente.service');
const catchAsync = require('../../utils/catchAsync');

class ClassificacaoClienteController {
  index = catchAsync(async (req, res) => {
    const classificacoes = await ClassificacaoClienteService.findAll();
    return res.status(200).send({ classificacoes });
  });

  show = catchAsync(async (req, res) => {
    const { id } = req.params;
    const classificacao = await ClassificacaoClienteService.findById(id);
    return res.status(200).send({ classificacao });
  });

  store = catchAsync(async (req, res) => {
    const { nome, status, tipo_categoria, quantidade, valor } = req.body;
    const novaClassificacao = await ClassificacaoClienteService.create({ nome, status, tipo_categoria, quantidade, valor });
    return res.status(201).send({
      message: 'Classificação criada com sucesso!',
      novaClassificacao,
    });
  });

  update = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { nome, status, tipo_categoria, quantidade, valor } = req.body;
    await ClassificacaoClienteService.update(id, { nome, status, tipo_categoria, quantidade, valor });
    return res.status(200).send({ message: 'Classificação atualizada com sucesso!' });
  });
}

module.exports = new ClassificacaoClienteController();
