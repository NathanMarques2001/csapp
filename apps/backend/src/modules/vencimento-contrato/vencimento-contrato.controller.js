const VencimentoContratoService = require('./vencimento-contrato.service');
const catchAsync = require('../../utils/catchAsync');

class VencimentoContratoController {
  getAll = catchAsync(async (req, res) => {
    const vencimentos = await VencimentoContratoService.findAll();
    return res.status(200).json({ vencimentos });
  });

  getToday = catchAsync(async (req, res) => {
    const vencimentos = await VencimentoContratoService.findToday();
    return res.status(200).json({ vencimentos });
  });

  emailData = catchAsync(async (req, res) => {
    const { id_contrato } = req.params;
    const data = await VencimentoContratoService.getEmailData(id_contrato);
    return res.status(200).json(data);
  });

  create = catchAsync(async (req, res) => {
    const { id_contrato, status, data_vencimento } = req.body;
    const novoVencimento = await VencimentoContratoService.create({ id_contrato, status, data_vencimento });
    return res.status(201).json(novoVencimento);
  });

  update = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, data_vencimento } = req.body;
    const vencimento = await VencimentoContratoService.update(id, { status, data_vencimento });
    return res.status(200).json(vencimento);
  });

  delete = catchAsync(async (req, res) => {
    const { id } = req.params;
    await VencimentoContratoService.delete(id);
    return res.status(204).send();
  });
}

module.exports = new VencimentoContratoController();
