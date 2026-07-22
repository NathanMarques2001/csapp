const Contrato = require('../models/Contrato');
const Cliente = require('../models/Cliente');
const VencimentoContratos = require('../models/VencimentoContratos');
const classifyCustomers = require('../utils/classifyCustomers');
const ContratoService = require('../services/ContratoService');

module.exports = {
  async index(req, res) {
    try {
      const { id } = req.params;

      const contrato = await Contrato.findByPk(id);

      if (!contrato) {
        return res.status(404).send({ message: `Nenhum contrato cadastrado com id ${id}!` });
      }

      return res.status(200).send({ contrato });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao buscar o contrato.' });
    }
  },

  async indexClient(req, res) {
    try {
      const { id } = req.params;

      const contratos = await Contrato.findAll({ where: { id_cliente: id } });

      return res.status(200).send({ contratos });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao buscar os contratos.' });
    }
  },

  async indexVendedor(req, res) {
    try {
      const { id } = req.params;
      const clientes = await Cliente.findAll({ where: { id_usuario: id } });
      let contratos = [];

      for (let cliente of clientes) {
        const contratosCliente = await Contrato.findAll({ where: { id_cliente: cliente.id } });
        contratos = contratos.concat(contratosCliente);
      }

      return res.status(200).send({ contratos });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao buscar os contratos.' });
    }
  },

  async indexAll(req, res) {
    try {
      const contratos = await Contrato.findAll();

      return res.status(200).send({ contratos });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao buscar os contratos.' });
    }
  },

  async store(req, res) {
    try {
      const { id_cliente, id_produto, id_faturado, dia_vencimento, indice_reajuste, nome_indice, proximo_reajuste, status, duracao, valor_mensal, quantidade, descricao, data_inicio } = req.body;

      // const containsLetters = /[a-zA-Z]/;

      // if (containsLetters.test(valor_mensal)) {
      //   return res.status(400).send({ message: 'O campo valor mensal só aceita números!' });
      // } else if (containsLetters.test(quantidade)) {
      //   return res.status(400).send({ message: 'O campo quantidade só aceita números!' });
      // }


      const contrato = await Contrato.create({ id_cliente, id_produto, id_faturado, dia_vencimento, indice_reajuste, nome_indice, proximo_reajuste, status, duracao, valor_mensal, quantidade, descricao, data_inicio });

      await classifyCustomers();

      const inicio = new Date(data_inicio);
      const vencimento = new Date(inicio.setMonth(inicio.getMonth() + duracao));
      await VencimentoContratos.create({ id_contrato: contrato.id, status: status, data_vencimento: vencimento });

      return res.status(201).send({
        message: 'Contrato criado com sucesso!',
        contrato
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao criar o contrato.' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { message, aviso } = await ContratoService.update(id, req.body);

      return res.status(200).send({ message, aviso });
    } catch (error) {
      console.error(error);
      if (error.message === 'Contrato não encontrado!') {
        return res.status(404).send({ message: error.message });
      }
      return res.status(500).send({ message: 'Ocorreu um erro ao atualizar o contrato.' });
    }
  },

  // async delete(req, res) {
  //   try {
  //     const { id } = req.params;

  //     const contrato = await Contrato.findByPk(id);

  //     if (!contrato) {
  //       return res.status(404).send({ message: 'Contrato não encontrado!' });
  //     }

  //     await Contrato.destroy({ where: { id: id } });

  //     return res.status(200).send({ message: 'Contrato deletado com sucesso!' });
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).send({ message: 'Ocorreu um erro ao deletar o contrato.' });
  //   }
  // }
}
