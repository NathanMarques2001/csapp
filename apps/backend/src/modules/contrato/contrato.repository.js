const { Op } = require('sequelize');
const Contrato = require('../../models/Contrato');
const Cliente = require('../../models/Cliente');
const Produto = require('../../models/Produto');
const Faturado = require('../../models/Faturado');
const Log = require('../../models/Log');
const Usuario = require('../../models/Usuario');
const VencimentoContratos = require('../../models/VencimentoContratos');

class ContratoRepository {
  async findById(id) {
    return await Contrato.findByPk(id);
  }

  async findAll() {
    return await Contrato.findAll();
  }

  async findByClienteId(id_cliente) {
    return await Contrato.findAll({ where: { id_cliente } });
  }

  async findClientesByUsuarioId(id_usuario) {
    return await Cliente.findAll({ where: { id_usuario }, attributes: ['id'] });
  }

  async findByClientesIds(clientesIds) {
    return await Contrato.findAll({ where: { id_cliente: { [Op.in]: clientesIds } } });
  }

  async create(data) {
    return await Contrato.create(data);
  }

  async update(contrato, data) {
    return await contrato.update(data);
  }

  async createVencimento(data) {
    return await VencimentoContratos.create(data);
  }

  async updateVencimento(id_contrato, data) {
    return await VencimentoContratos.update(data, { where: { id_contrato } });
  }

  async createLog(data) {
    return await Log.create(data);
  }

  async findProdutoById(id) {
    return await Produto.findByPk(id, { attributes: ['nome'] });
  }

  async findProdutoByNome(nome) {
    return await Produto.findOne({ where: { nome } });
  }

  async findUsuarioById(id) {
    return await Usuario.findByPk(id, { attributes: ['nome'] });
  }

  async findClienteByCpfCnpj(cpf_cnpj) {
    return await Cliente.findOne({ where: { cpf_cnpj } });
  }

  async findFaturadoByNome(nome) {
    return await Faturado.findOne({ where: { nome } });
  }

  async findContratoExistente(id_cliente, id_produto) {
    return await Contrato.findOne({ where: { id_cliente, id_produto } });
  }
}

module.exports = new ContratoRepository();
