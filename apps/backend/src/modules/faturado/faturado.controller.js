const FaturadoService = require('./faturado.service');
const catchAsync = require('../../utils/catchAsync');

class FaturadoController {
  index = catchAsync(async (req, res) => {
    const { id } = req.params;
    const faturado = await FaturadoService.findById(id);
    return res.status(200).send({ faturado });
  });

  indexAll = catchAsync(async (req, res) => {
    const faturados = await FaturadoService.findAll();
    return res.status(200).send({ faturados });
  });

  store = catchAsync(async (req, res) => {
    const { nome } = req.body;
    const faturado = await FaturadoService.create({ nome });
    return res.status(201).send({
      message: 'Faturado criado com sucesso!',
      faturado,
    });
  });

  update = catchAsync(async (req, res) => {
    const { nome, status } = req.body;
    const { id } = req.params;
    await FaturadoService.update(id, { nome, status });
    return res.status(200).send({ message: 'Faturado atualizado com sucesso!' });
  });
}

module.exports = new FaturadoController();
