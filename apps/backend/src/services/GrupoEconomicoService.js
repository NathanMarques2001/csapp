const GrupoEconomicoRepository = require('../repositories/GrupoEconomicoRepository');
const ClienteRepository = require('../repositories/ClienteRepository');
const ContratoRepository = require('../repositories/ContratoRepository');
const classificarClientes = require('../utils/classificacaoClientes');
const AppError = require('../utils/AppError');

class GrupoEconomicoService {
  async listarTodos() {
    return await GrupoEconomicoRepository.findAll();
  }

  async buscarPorId(id) {
    const grupo = await GrupoEconomicoRepository.findById(id);
    if (!grupo) {
      throw new AppError('Grupo econômico não encontrado!', 404);
    }
    return grupo;
  }

  async criar(data) {
    // A validação de Zod já garantiu que 'nome' existe e etc.
    return await GrupoEconomicoRepository.create({
      ...data,
      status: 'ativo'
    });
  }

  async atualizar(id, data) {
    await this.buscarPorId(id); // Garante que existe
    await GrupoEconomicoRepository.update(id, data);
    return { message: 'Grupo econômico atualizado com sucesso!' };
  }

  async alternarStatus(id) {
    const grupo = await this.buscarPorId(id);

    if (grupo.status === 'ativo') {
      await GrupoEconomicoRepository.update(id, { status: 'inativo' });

      // Lógica de inativação em cascata
      const clientes = await ClienteRepository.findByGrupoEconomicoId(id);
      for (const cliente of clientes) {
        if (cliente.status === 'ativo') {
          await ClienteRepository.updateStatus(cliente.id, 'inativo');
          await ContratoRepository.updateStatusByClienteId(cliente.id, 'inativo');
        }
      }
      await classificarClientes();
    } else {
      await GrupoEconomicoRepository.update(id, { status: 'ativo' });
    }

    return { message: 'Status alterado com sucesso!' };
  }
}

module.exports = new GrupoEconomicoService();
