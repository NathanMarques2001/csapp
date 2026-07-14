const FatosImportantesService = require('./fatos-importantes.service');
const catchAsync = require('../../utils/catchAsync');

class FatosImportantesController {
  indexAll = catchAsync(async (req, res) => {
    const fatosImportantes = await FatosImportantesService.findAll();
    return res.status(200).send({ fatosImportantes });
  });

  index = catchAsync(async (req, res) => {
    const { id_cliente } = req.params;
    const fatos_importantes = await FatosImportantesService.findByClienteId(id_cliente);
    return res.status(200).send({ fatos_importantes });
  });

  indexFato = catchAsync(async (req, res) => {
    const { id } = req.params;
    const fatoImportante = await FatosImportantesService.findById(id);
    return res.status(200).send({ fatoImportante });
  });

  store = catchAsync(async (req, res) => {
    const { id_cliente, conteudo } = req.body;
    const fatoImportante = await FatosImportantesService.create({ id_cliente, conteudo });
    return res.status(201).send({
      message: 'Fato importante criado com sucesso!',
      fatoImportante,
    });
  });

  update = catchAsync(async (req, res) => {
    const { conteudo } = req.body;
    const { id } = req.params;
    await FatosImportantesService.update(id, { conteudo });
    return res.status(200).send({ message: 'Fato importante atualizado com sucesso!' });
  });

  delete = catchAsync(async (req, res) => {
    const { id } = req.params;
    await FatosImportantesService.delete(id);
    return res.status(200).send({ message: 'Fato importante deletado com sucesso!' });
  });
}

module.exports = new FatosImportantesController();
