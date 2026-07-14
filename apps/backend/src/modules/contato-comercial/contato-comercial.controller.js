const ContatoComercialService = require('./contato-comercial.service');
const catchAsync = require('../../utils/catchAsync');

class ContatoComercialController {
  indexAll = catchAsync(async (req, res) => {
    const contatosComerciais = await ContatoComercialService.findAll();
    return res.status(200).send({ contatosComerciais });
  });

  index = catchAsync(async (req, res) => {
    const { id_cliente } = req.params;
    const contatos_comerciais = await ContatoComercialService.findByClienteId(id_cliente);
    return res.status(200).send({ contatos_comerciais });
  });

  indexContato = catchAsync(async (req, res) => {
    const { id } = req.params;
    const contatoComercial = await ContatoComercialService.findById(id);
    return res.status(200).send({ contatoComercial });
  });

  store = catchAsync(async (req, res) => {
    const { id_cliente, conteudo } = req.body;
    const contatoComercial = await ContatoComercialService.create({ id_cliente, conteudo });
    return res.status(201).send({
      message: 'Contato comercial criado com sucesso!',
      contatoComercial,
    });
  });

  update = catchAsync(async (req, res) => {
    const { conteudo } = req.body;
    const { id } = req.params;
    await ContatoComercialService.update(id, { conteudo });
    return res.status(200).send({ message: 'Contato comercial atualizado com sucesso!' });
  });

  delete = catchAsync(async (req, res) => {
    const { id } = req.params;
    await ContatoComercialService.delete(id);
    return res.status(200).send({ message: 'Contato comercial deletado com sucesso!' });
  });
}

module.exports = new ContatoComercialController();
