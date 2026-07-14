const FabricanteService = require('./fabricante.service');
const catchAsync = require('../../utils/catchAsync');

class FabricanteController {
  index = catchAsync(async (req, res) => {
    const { id } = req.params;
    const fabricante = await FabricanteService.findById(id);
    return res.status(200).send({ fabricante });
  });

  indexAll = catchAsync(async (req, res) => {
    const fabricantes = await FabricanteService.findAll();
    return res.status(200).send({ fabricantes });
  });

  store = catchAsync(async (req, res) => {
    const { nome } = req.body;
    const fabricante = await FabricanteService.create({ nome });
    return res.status(201).send({
      message: 'Fabricante criado com sucesso!',
      fabricante,
    });
  });

  update = catchAsync(async (req, res) => {
    const { nome, status } = req.body;
    const { id } = req.params;
    await FabricanteService.update(id, { nome, status });
    return res.status(200).send({ message: 'Fabricante atualizado com sucesso!' });
  });
}

module.exports = new FabricanteController();
