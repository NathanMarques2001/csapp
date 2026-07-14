const HistoricoService = require('./historico.service');
const catchAsync = require('../../utils/catchAsync');

class HistoricoController {
  indexClientes = catchAsync(async (req, res) => {
    const { dataInicio, dataFim } = req.query;
    const historico = await HistoricoService.buscarHistoricoClientes(dataInicio, dataFim);
    return res.json(historico);
  });

  indexContratos = catchAsync(async (req, res) => {
    const { dataInicio, dataFim } = req.query;
    const historico = await HistoricoService.buscarHistoricoContratos(dataInicio, dataFim);
    return res.json(historico);
  });

  gerarSnapshotManual = catchAsync(async (req, res) => {
    await HistoricoService.gerarSnapshotDiario();
    return res.json({ message: 'Snapshot gerado ou completado com sucesso.' });
  });
}

module.exports = new HistoricoController();
