const RelatorioService = require('./relatorio.service');
const catchAsync = require('../../utils/catchAsync');

class RelatorioController {
  getRelatorioGeral = catchAsync(async (req, res) => {
    const resultados = await RelatorioService.getRelatorioGeral();
    return res.status(200).json(resultados);
  });
}

module.exports = new RelatorioController();
