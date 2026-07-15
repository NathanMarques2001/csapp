const catchAsync = require('../utils/catchAsync');
const GrupoEconomicoService = require('../services/GrupoEconomicoService');

module.exports = {
  index: catchAsync(async (req, res) => {
    const { id } = req.params;
    const grupoEconomico = await GrupoEconomicoService.buscarPorId(id);
    return res.status(200).send({ grupoEconomico });
  }),

  indexAll: catchAsync(async (req, res) => {
    const grupoEconomico = await GrupoEconomicoService.listarTodos();
    return res.status(200).send({ grupoEconomico });
  }),

  inactiveOrActive: catchAsync(async (req, res) => {
    const { id } = req.params;
    const response = await GrupoEconomicoService.alternarStatus(id);
    return res.status(200).send(response);
  }),

  store: catchAsync(async (req, res) => {
    const grupoEconomico = await GrupoEconomicoService.criar(req.body);
    return res.status(201).send({
      message: "Grupo econômico criado com sucesso!",
      grupoEconomico,
    });
  }),

  update: catchAsync(async (req, res) => {
    const { id } = req.params;
    const response = await GrupoEconomicoService.atualizar(id, req.body);
    return res.status(200).send(response);
  }),
};
