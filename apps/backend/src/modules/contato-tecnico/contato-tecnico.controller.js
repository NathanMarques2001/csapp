const ContatoTecnicoService = require('./contato-tecnico.service');
const catchAsync = require('../../utils/catchAsync');

class ContatoTecnicoController {
  indexAll = catchAsync(async (req, res) => {
    const contatosTecnicos = await ContatoTecnicoService.findAll();
    return res.status(200).send({ contatosTecnicos });
  });

  index = catchAsync(async (req, res) => {
    const { id_cliente } = req.params;
    const contatos_tecnicos = await ContatoTecnicoService.findByClienteId(id_cliente);
    return res.status(200).send({ contatos_tecnicos });
  });

  indexContato = catchAsync(async (req, res) => {
    const { id } = req.params;
    const contatoTecnico = await ContatoTecnicoService.findById(id);
    return res.status(200).send({ contatoTecnico });
  });

  store = catchAsync(async (req, res) => {
    const { id_cliente, conteudo } = req.body;
    const contatoTecnico = await ContatoTecnicoService.create({ id_cliente, conteudo });
    return res.status(201).send({
      message: 'Contato técnico criado com sucesso!',
      contatoTecnico,
    });
  });

  update = catchAsync(async (req, res) => {
    const { conteudo } = req.body;
    const { id } = req.params;
    await ContatoTecnicoService.update(id, { conteudo });
    return res.status(200).send({ message: 'Contato técnico atualizado com sucesso!' });
  });

  delete = catchAsync(async (req, res) => {
    const { id } = req.params;
    await ContatoTecnicoService.delete(id);
    return res.status(200).send({ message: 'Contato técnico deletado com sucesso!' });
  });
}

module.exports = new ContatoTecnicoController();
