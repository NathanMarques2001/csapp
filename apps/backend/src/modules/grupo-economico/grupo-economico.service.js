const GrupoEconomicoRepository = require('./grupo-economico.repository');
const classificarClientes = require('../../utils/classificacaoClientes');
const AppError = require('../../utils/AppError');

class GrupoEconomicoService {
  async findAll() {
    const grupos = await GrupoEconomicoRepository.findAll();
    if (!grupos || grupos.length === 0) {
      throw new AppError('Nenhum segmento cadastrado!', 404);
    }
    return grupos;
  }

  async findById(id) {
    const grupo = await GrupoEconomicoRepository.findById(id);
    if (!grupo) {
      throw new AppError('Grupo econômico não encontrado!', 404);
    }
    return grupo;
  }

  async create(data) {
    return await GrupoEconomicoRepository.create(data);
  }

  async update(id, data) {
    const grupo = await GrupoEconomicoRepository.findById(id);
    if (!grupo) {
      throw new AppError('Grupo econômico não encontrado!', 404);
    }
    await GrupoEconomicoRepository.update(id, data);
    return true;
  }

  async toggleEInativarCascata(id) {
    const grupo = await GrupoEconomicoRepository.findById(id);
    if (!grupo) {
      throw new AppError('Cliente não encontrado!', 404);
    }

    if (grupo.status === 'ativo') {
      await GrupoEconomicoRepository.updateStatus(id, 'inativo');
      
      const clientes = await GrupoEconomicoRepository.findClientesByGrupoId(id);
      for (const cliente of clientes) {
        if (cliente.status === 'ativo') {
          await GrupoEconomicoRepository.inativarClienteEContratos(cliente.id);
        }
      }
      await classificarClientes();
    } else {
      await GrupoEconomicoRepository.updateStatus(id, 'ativo');
    }
    return true;
  }
}

module.exports = new GrupoEconomicoService();
