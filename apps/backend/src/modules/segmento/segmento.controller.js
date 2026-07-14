const SegmentoService = require('./segmento.service');
const catchAsync = require('../../utils/catchAsync');

class SegmentoController {
  index = catchAsync(async (req, res) => {
    const { id } = req.params;
    const segmento = await SegmentoService.findById(id);
    return res.status(200).send({ segmento });
  });

  indexAll = catchAsync(async (req, res) => {
    const segmentos = await SegmentoService.findAll();
    return res.status(200).send({ segmentos });
  });

  store = catchAsync(async (req, res) => {
    const { nome } = req.body;
    const segmento = await SegmentoService.create({ nome });
    return res.status(201).send({
      message: 'Segmento criado com sucesso!',
      segmento,
    });
  });

  update = catchAsync(async (req, res) => {
    const { nome, status } = req.body;
    const { id } = req.params;
    await SegmentoService.update(id, { nome, status });
    return res.status(200).send({ message: 'Segmento atualizado com sucesso!' });
  });
}

module.exports = new SegmentoController();
