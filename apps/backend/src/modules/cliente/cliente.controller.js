const ClienteService = require('./cliente.service');
const catchAsync = require('../../utils/catchAsync');

class ClienteController {
  index = catchAsync(async (req, res) => {
    const { id } = req.params;
    const cliente = await ClienteService.findById(id);
    return res.status(200).send({ cliente });
  });

  indexGrupoEconomico = catchAsync(async (req, res) => {
    const { id } = req.params;
    const clientes = await ClienteService.findByGrupoEconomico(id);
    return res.status(200).send({ clientes });
  });

  indexAll = catchAsync(async (req, res) => {
    const clientes = await ClienteService.findAll();
    return res.status(200).send({ clientes });
  });

  migrate = catchAsync(async (req, res) => {
    const { antigo_vendedor, novo_vendedor } = req.body;
    await ClienteService.migrate(antigo_vendedor, novo_vendedor);
    return res.status(200).send({ message: 'Migração de clientes realizada com sucesso!' });
  });

  inactiveOrActive = catchAsync(async (req, res) => {
    const { id } = req.params;
    const message = await ClienteService.toggleStatus(id);
    return res.status(200).send({ message });
  });

  store = catchAsync(async (req, res) => {
    const cliente = await ClienteService.create(req.body);
    return res.status(201).send({
      message: 'Cliente criado com sucesso!',
      cliente,
    });
  });

  update = catchAsync(async (req, res) => {
    const { id } = req.params;
    await ClienteService.update(id, req.body);
    return res.status(200).send({ message: 'Cliente atualizado com sucesso!' });
  });

  gestoresComNascimento = catchAsync(async (req, res) => {
    const clientes = await ClienteService.findGestoresComNascimento();
    return res.status(200).send({ clientes });
  });
}

module.exports = new ClienteController();
