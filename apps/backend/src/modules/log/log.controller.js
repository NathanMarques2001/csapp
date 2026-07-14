const LogService = require('./log.service');
const catchAsync = require('../../utils/catchAsync');

class LogController {
  index = catchAsync(async (req, res) => {
    const { id_contrato } = req.params;
    const logs = await LogService.findByContratoId(id_contrato);
    return res.status(200).send({ logs });
  });

  indexAll = catchAsync(async (req, res) => {
    const logs = await LogService.findAll();
    return res.status(200).send({ logs });
  });

  store = catchAsync(async (req, res) => {
    const { nome_usuario, id_usuario, id_contrato, alteracao } = req.body;
    const log = await LogService.create({ nome_usuario, id_usuario, id_contrato, alteracao });
    return res.status(201).send({
      message: 'Log criado com sucesso!',
      log,
    });
  });
}

module.exports = new LogController();
