const ClassificacaoClienteRepository = require('./classificacao-cliente.repository');
const classificarClientes = require('../../utils/classificacaoClientes');
const AppError = require('../../utils/AppError');

class ClassificacaoClienteService {
  async findAll() {
    const classificacoesQuantidade = await ClassificacaoClienteRepository.findAllQuantidade();
    const classificacoesValor = await ClassificacaoClienteRepository.findAllValor();
    const classificacoes = [...classificacoesQuantidade, ...classificacoesValor];

    if (classificacoes.length === 0) {
      throw new AppError('Nenhuma classificação cadastrada.', 404);
    }

    return classificacoes;
  }

  async findById(id) {
    const classificacao = await ClassificacaoClienteRepository.findById(id);
    if (!classificacao) {
      throw new AppError('Classificação não encontrada.', 404);
    }
    return classificacao;
  }

  async create(data) {
    const { valor, tipo_categoria } = data;

    if (valor !== undefined && valor !== null && parseFloat(valor) <= 0) {
      throw new AppError('O valor deve ser maior que zero.', 400);
    }

    if (tipo_categoria === 'quantidade') {
      const jaExisteQuantidade = await ClassificacaoClienteRepository.findQuantidade();
      if (jaExisteQuantidade) {
        throw new AppError("Já existe uma classificação do tipo 'quantidade'. Só é permitida uma.", 400);
      }
    }

    try {
      const novaClassificacao = await ClassificacaoClienteRepository.create(data);
      await classificarClientes();
      return novaClassificacao;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new AppError('Já existe uma classificação com esse nome.', 400);
      }
      throw error;
    }
  }

  async update(id, data) {
    const { valor, tipo_categoria } = data;
    const classificacao = await ClassificacaoClienteRepository.findById(id);
    if (!classificacao) {
      throw new AppError('Classificação não encontrada.', 404);
    }

    if (valor !== undefined && valor !== null && parseFloat(valor) <= 0) {
      throw new AppError('O valor deve ser maior que zero.', 400);
    }

    if (tipo_categoria === 'quantidade' && classificacao.tipo_categoria !== 'quantidade') {
      const jaExisteQuantidade = await ClassificacaoClienteRepository.findQuantidade(id);
      if (jaExisteQuantidade) {
        throw new AppError("Já existe uma classificação do tipo 'quantidade'. Só é permitida uma.", 400);
      }
    }

    try {
      await ClassificacaoClienteRepository.update(classificacao, data);
      await classificarClientes();
      return true;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new AppError('Já existe uma classificação com esse nome.', 400);
      }
      throw error;
    }
  }
}

module.exports = new ClassificacaoClienteService();
