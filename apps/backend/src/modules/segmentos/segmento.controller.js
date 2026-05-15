const segmentoService = require('./segmento.service');
const catchAsync = require('../../common/utils/catchAsync');

class SegmentoController {
    indexAll = catchAsync(async (req, res) => {
        const segmentos = await segmentoService.getAllSegmentos();
        return res.status(200).send({ segmentos });
    });

    index = catchAsync(async (req, res) => {
        const { id } = req.params;
        const segmento = await segmentoService.getSegmentoById(id);
        return res.status(200).send({ segmento });
    });

    store = catchAsync(async (req, res) => {
        const { nome } = req.body;
        const segmento = await segmentoService.createSegmento({ nome });
        return res.status(201).send({
            message: 'Segmento criado com sucesso!',
            segmento,
        });
    });

    update = catchAsync(async (req, res) => {
        const { id } = req.params;
        const { nome, status } = req.body;
        await segmentoService.updateSegmento(id, { nome, status });
        return res.status(200).send({ message: 'Segmento atualizado com sucesso!' });
    });
}

module.exports = new SegmentoController();
