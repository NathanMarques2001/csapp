const fabricanteService = require('./fabricante.service');
const catchAsync = require('../../common/utils/catchAsync');

class FabricanteController {
    indexAll = catchAsync(async (req, res) => {
        const { page, limit } = req.query;

        const result = await fabricanteService.getAllFabricantes({ page, limit });

        return res.status(200).json({
            status: 'success',
            ...result
        });
    });

    index = catchAsync(async (req, res) => {
        const { id } = req.params;

        const fabricante = await fabricanteService.getFabricanteById(id);

        return res.status(200).json({
            status: 'success',
            data: { fabricante }
        });
    });

    store = catchAsync(async (req, res) => {
        const data = req.body;

        const fabricante = await fabricanteService.createFabricante(data);

        return res.status(201).json({
            status: 'success',
            message: 'Fabricante criado com sucesso!',
            data: { fabricante }
        });
    });

    update = catchAsync(async (req, res) => {
        const { id } = req.params;
        const data = req.body;

        const fabricante = await fabricanteService.updateFabricante(id, data);

        return res.status(200).json({
            status: 'success',
            message: 'Fabricante atualizado com sucesso!',
            data: { fabricante }
        });
    });
}

module.exports = new FabricanteController();
