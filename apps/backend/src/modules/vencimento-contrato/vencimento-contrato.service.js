const VencimentoContratoRepository = require('./vencimento-contrato.repository');
const AppError = require('../../utils/AppError');

class VencimentoContratoService {
  async findAll() {
    return await VencimentoContratoRepository.findAll();
  }

  async findToday() {
    return await VencimentoContratoRepository.findToday();
  }

  async getEmailData(id_contrato) {
    const dados = await VencimentoContratoRepository.getDadosEmail(id_contrato);
    if (!dados) {
      throw new AppError('Contrato não encontrado', 404);
    }

    const { cliente, usuario } = dados;

    return {
      usuario_nome: usuario ? usuario.nome : null,
      usuario_email: usuario ? usuario.email : null,
      cliente_nome: cliente ? cliente.nome_fantasia : null,
      cliente_cnpj: cliente ? cliente.cpf_cnpj : null,
    };
  }

  async create(data) {
    const { id_contrato } = data;
    const contrato = await VencimentoContratoRepository.findContratoById(id_contrato);
    if (!contrato) {
      throw new AppError('Contrato não encontrado', 404);
    }
    return await VencimentoContratoRepository.create(data);
  }

  async update(id, data) {
    const vencimento = await VencimentoContratoRepository.findById(id);
    if (!vencimento) {
      throw new AppError('Vencimento não encontrado', 404);
    }
    return await VencimentoContratoRepository.update(vencimento, data);
  }

  async delete(id) {
    const vencimento = await VencimentoContratoRepository.findById(id);
    if (!vencimento) {
      throw new AppError('Vencimento não encontrado', 404);
    }
    await VencimentoContratoRepository.delete(vencimento);
    return true;
  }
}

module.exports = new VencimentoContratoService();
