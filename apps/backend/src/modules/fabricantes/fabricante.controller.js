const fabricanteService = require('./fabricante.service');
const catchAsync = require('../../common/utils/catchAsync');

class FabricanteController {
    indexAll = catchAsync(async (req, res) => {
        const fabricantes = await fabricanteService.getAllFabricantes();
        return res.status(200).send({ fabricantes });
    });

    index = catchAsync(async (req, res) => {
        const { id } = req.params;
        const fabricante = await fabricanteService.getFabricanteById(id);
        return res.status(200).send({ fabricante });
    });

    store = catchAsync(async (req, res) => {
        const { nome } = req.body;
        const fabricante = await fabricanteService.createFabricante({ nome });
        return res.status(201).send({
            message: 'Fabricante criado com sucesso!',
            fabricante,
        });
    });

    update = catchAsync(async (req, res) => {
        const { id } = req.params;
        const { nome, status } = req.body;
        await fabricanteService.updateFabricante(id, { nome, status });
        return res.status(200).send({ message: 'Fabricante atualizado com sucesso!' });
    });
}

module.exports = new FabricanteController();
