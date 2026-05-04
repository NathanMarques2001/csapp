const segmentoService = require('./segmento.service');
const catchAsync = require('../../common/utils/catchAsync');

class SegmentoController {
    indexAll = catchAsync(async (req, res) => {
        const { page, limit } = req.query;

        const result = await segmentoService.getAllSegmentos({ page, limit });

        return res.status(200).json({
            status: 'success',
            ...result
        });
    });

    index = catchAsync(async (req, res) => {
        const { id } = req.params;

        const segmento = await segmentoService.getSegmentoById(id);

        return res.status(200).json({
            status: 'success',
            data: { segmento }
        });
    });

    store = catchAsync(async (req, res) => {
        const data = req.body;

        const segmento = await segmentoService.createSegmento(data);

        return res.status(201).json({
            status: 'success',
            message: 'Segmento criado com sucesso!',
            data: { segmento }
        });
    });

    update = catchAsync(async (req, res) => {
        const { id } = req.params;
        const data = req.body;

        const segmento = await segmentoService.updateSegmento(id, data);

        return res.status(200).json({
            status: 'success',
            message: 'Segmento atualizado com sucesso!',
            data: { segmento }
        });
    });
}

module.exports = new SegmentoController();
