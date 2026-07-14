const ClienteRepository = require('./cliente.repository');
const classificarClientes = require('../../utils/classificacaoClientes');
const AppError = require('../../utils/AppError');
const NotificacaoService = require('../../services/NotificacaoService');
const Notificacao = require('../../models/Notificacao');

class ClienteService {
  async findById(id) {
    const cliente = await ClienteRepository.findById(id);
    if (!cliente) {
      throw new AppError('Cliente não encontrado!', 404);
    }
    return cliente;
  }

  async findByGrupoEconomico(id) {
    const clientes = await ClienteRepository.findByGrupoEconomico(id);
    if (!clientes || clientes.length === 0) {
      throw new AppError('Nenhum cliente cadastrado!', 404);
    }
    return clientes;
  }

  async findAll() {
    return await ClienteRepository.findAll();
  }

  async create(data) {
    try {
      return await ClienteRepository.create(data);
    } catch (error) {
      if (error.message && error.message.includes('inválido')) {
        throw new AppError(error.message, 400); // Retaining existing validation logic mapping
      }
      throw error;
    }
  }

  async migrate(antigo_vendedor, novo_vendedor) {
    const res = await ClienteRepository.migrate(antigo_vendedor, novo_vendedor);
    try {
      await Notificacao.update(
        { id_usuario: novo_vendedor },
        { where: { id_usuario: antigo_vendedor, confirmado_sn: false } }
      );
    } catch (err) {
      console.error('[NOTIF_SYNC] Erro ao migrar notificações ativas do vendedor:', err);
    }
    return res;
  }

  async toggleStatus(id) {
    const cliente = await ClienteRepository.findById(id);
    if (!cliente) {
      throw new AppError('Cliente não encontrado!', 404);
    }

    if (cliente.status === 'ativo') {
      await ClienteRepository.updateStatus(id, 'inativo');
      await ClienteRepository.inativarContratos(id);
      await classificarClientes();
      return 'Cliente e contratos inativados com sucesso!';
    } else {
      await ClienteRepository.updateStatus(id, 'ativo');
      await classificarClientes();
      return 'Cliente ativado com sucesso!';
    }
  }

  async update(id, data) {
    const cliente = await ClienteRepository.findById(id);
    if (!cliente) {
      throw new AppError('Cliente não encontrado!', 404);
    }

    try {
      await ClienteRepository.update(id, data);
      await classificarClientes();
      try {
        await NotificacaoService.atualizarNotificacoesAtivasDoCliente(cliente.id);
      } catch (err) {
        console.error('[NOTIF_SYNC] Erro ao sincronizar notificações ativas do cliente:', err);
      }
      return await ClienteRepository.findById(id);
    } catch (error) {
      if (error.message && error.message.includes('inválido')) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  async findGestoresComNascimento() {
    const clientes = await ClienteRepository.findGestoresComNascimento();
    if (!clientes || clientes.length === 0) {
      throw new AppError('Nenhum cliente encontrado!', 404);
    }
    return clientes;
  }
}

module.exports = new ClienteService();
