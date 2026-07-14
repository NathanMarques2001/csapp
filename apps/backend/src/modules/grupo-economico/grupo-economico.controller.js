const GrupoEconomicoService = require('./grupo-economico.service');
const catchAsync = require('../../utils/catchAsync');

class GrupoEconomicoController {
  index = catchAsync(async (req, res) => {
    const { id } = req.params;
    const grupoEconomico = await GrupoEconomicoService.findById(id);
    return res.status(200).send({ grupoEconomico });
  });

  indexAll = catchAsync(async (req, res) => {
    const grupoEconomico = await GrupoEconomicoService.findAll();
    return res.status(200).send({ grupoEconomico });
  });

  inactiveOrActive = catchAsync(async (req, res) => {
    const { id } = req.params;
    await GrupoEconomicoService.toggleEInativarCascata(id);
    return res.status(200).send({
      message: 'Grupo econômico, clientes e contratos inativados com sucesso!',
    });
  });

  store = catchAsync(async (req, res) => {
    const { nome } = req.body;
    const grupoEconomico = await GrupoEconomicoService.create({ nome });
    return res.status(201).send({
      message: 'Grupo econômico criado com sucesso!',
      grupoEconomico,
    });
  });

  update = catchAsync(async (req, res) => {
    const { nome, status } = req.body;
    const { id } = req.params;
    await GrupoEconomicoService.update(id, { nome, status });
    return res.status(200).send({ message: 'Grupo econômico com sucesso!' });
  });
}

module.exports = new GrupoEconomicoController();
