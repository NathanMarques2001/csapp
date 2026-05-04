const Contrato = require('../models/Contrato');
const Cliente = require('../models/Cliente');
const VencimentoContratos = require('../models/VencimentoContratos');
const classifyCustomers = require('../utils/classifyCustomers');

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

      if (contratos.length == 0) {
        return res.status(404).send({ message: 'Nenhum contrato cadastrado!' });
      }

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

      if (contratos.length == 0) {
        return res.status(404).send({ message: 'Nenhum contrato cadastrado!' });
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

      if (contratos.length == 0) {
        return res.status(404).send({ message: 'Nenhum contrato cadastrado!' });
      }

      return res.status(200).send({ contratos });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao buscar os contratos.' });
    }
  },

  async store(req, res) {
    try {
      const { id_cliente, id_produto, faturado, id_faturado, dia_vencimento, indice_reajuste, nome_indice, proximo_reajuste, status, duracao, valor_mensal, quantidade, descricao, data_inicio } = req.body;

      // const containsLetters = /[a-zA-Z]/;

      // if (containsLetters.test(valor_mensal)) {
      //   return res.status(400).send({ message: 'O campo valor mensal só aceita números!' });
      // } else if (containsLetters.test(quantidade)) {
      //   return res.status(400).send({ message: 'O campo quantidade só aceita números!' });
      // }


      const contrato = await Contrato.create({ id_cliente, id_produto, faturado, id_faturado, dia_vencimento, indice_reajuste, nome_indice, proximo_reajuste, status, duracao, valor_mensal, quantidade, descricao, data_inicio });

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
      const { id_cliente, id_produto, faturado, id_faturado, dia_vencimento, indice_reajuste, nome_indice, proximo_reajuste, status, duracao, valor_mensal, quantidade, descricao, data_inicio } = req.body;
      const { id } = req.params;
      //const containsLetters = /[a-zA-Z]/;

      const contrato = await Contrato.findByPk(id);

      if (!contrato) {
        return res.status(404).send({ message: 'Contrato não encontrado!' });
      } //else if (containsLetters.test(valor_mensal)) {
      //   return res.status(400).send({ message: 'O campo valor mensal só aceita números!' });
      // } else if (containsLetters.test(quantidade)) {
      //   return res.status(400).send({ message: 'O campo quantidade só aceita números!' });
      // }

      await Contrato.update({ id_cliente, id_produto, faturado, id_faturado, dia_vencimento, indice_reajuste, nome_indice, proximo_reajuste, status, duracao, valor_mensal, quantidade, descricao, data_inicio }, { where: { id: id } });

      await classifyCustomers();

      if (data_inicio || status || duracao) {
        const inicio = data_inicio ? new Date(data_inicio) : new Date(contrato.data_inicio);
        const duracaoContrato = duracao ? duracao : contrato.duracao;
        const vencimento = new Date(inicio.setMonth(inicio.getMonth() + Number(duracaoContrato)));
        const statusContrato = status ? status : contrato.status;
        await VencimentoContratos.update(
          { id_contrato: contrato.id, status: statusContrato, data_vencimento: vencimento },
          { where: { id_contrato: contrato.id } }
        );
      }

      return res.status(200).send({ message: 'Contrato atualizado com sucesso!' });
    } catch (error) {
      console.error(error);
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
