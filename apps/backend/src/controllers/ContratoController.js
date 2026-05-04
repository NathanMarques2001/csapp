const Contrato = require("../models/Contrato");
const Cliente = require("../models/Cliente");
const VencimentoContratos = require("../models/VencimentoContratos");
const ContratoService = require("../services/ContratoService");
const classificarClientes = require("../utils/classificacaoClientes");


module.exports = {
  async index(req, res) {
    try {
      const { id } = req.params;
      const contrato = await Contrato.findByPk(id);

      if (!contrato) {
        return res
          .status(404)
          .send({ message: `Nenhum contrato cadastrado com id ${id}!` });
      }

      return res.status(200).send({ contrato });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao buscar o contrato." });
    }
  },

  async indexClient(req, res) {
    try {
      const { id } = req.params;

      const clienteExiste = await Cliente.findByPk(id);
      if (!clienteExiste) {
        return res
          .status(404)
          .send({ message: `Cliente ${id} não encontrado!` });
      }

      const contratos = await Contrato.findAll({ where: { id_cliente: id } });

      return res.status(200).send({ contratos });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao buscar os contratos." });
    }
  },

  async indexVendedor(req, res) {
    try {
      const { id } = req.params;
      const clientes = await Cliente.findAll({ where: { id_usuario: id } });
      let contratos = [];

      for (let cliente of clientes) {
        const contratosCliente = await Contrato.findAll({
          where: { id_cliente: cliente.id },
        });
        contratos = contratos.concat(contratosCliente);
      }

      if (contratos.length == 0) {
        return res.status(404).send({ message: "Nenhum contrato cadastrado!" });
      }

      return res.status(200).send({ contratos });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao buscar os contratos." });
    }
  },

  async indexAll(req, res) {
    try {
      const contratos = await Contrato.findAll();

      // if (contratos.length == 0) {
      //   return res.status(404).send({ message: "Nenhum contrato cadastrado!" });
      // }
      // FIX: Retornar array vazio com 200 OK é o padrão RESTful correto para listas.
      return res.status(200).send({ contratos });

      return res.status(200).send({ contratos });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao buscar os contratos." });
    }
  },

  async store(req, res) {
    try {
      // Nota: Mantemos parte da lógica de criação aqui por ser simples, 
      // mas o update complexo e importação foram movidos.
      // O tratamento de quantidade pode ser chamado do service também.

      const {
        id_cliente,
        id_produto,
        id_faturado,
        dia_vencimento,
        indice_reajuste,
        nome_indice,
        proximo_reajuste,
        status,
        duracao,
        valor_mensal,
        quantidade,
        descricao,
        link_contrato,
        data_inicio,
        tipo_faturamento,
        renovacao_automatica,
      } = req.body;

      const { quantidadeFinal, aviso } = await ContratoService.tratarQuantidade(
        id_produto,
        quantidade
      );

      const valor_antigo = valor_mensal;

      const contrato = await Contrato.create({
        id_cliente,
        id_produto,
        id_faturado,
        dia_vencimento,
        indice_reajuste,
        nome_indice,
        proximo_reajuste,
        status,
        duracao,
        valor_mensal,
        quantidade: quantidadeFinal,
        descricao,
        link_contrato,
        data_inicio,
        tipo_faturamento,
        renovacao_automatica,
        valor_antigo
      });

      await classificarClientes();

      const inicio = new Date(data_inicio);
      const vencimento = new Date(inicio.setMonth(inicio.getMonth() + duracao));
      await VencimentoContratos.create({
        id_contrato: contrato.id,
        status: status,
        data_vencimento: vencimento,
      });

      let message = "Contrato criado com sucesso!";
      if (aviso) {
        message += ` (Aviso: ${aviso})`;
      }

      return res.status(201).send({ message, contrato });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao criar o contrato." });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await ContratoService.update(id, req.body);

      let message = result.message;
      if (result.aviso) {
        message += ` (Aviso: ${result.aviso})`;
      }

      return res.status(200).send({ message, alteracoes: result.alteracoes });
    } catch (error) {
      console.error(error);
      const status = error.message === "Contrato não encontrado!" ? 404 : 500;
      return res.status(status).send({ message: error.message || "Ocorreu um erro ao atualizar o contrato." });
    }
  },

  async importarContratosExcel(req, res) {
    if (!req.file) {
      return res.status(400).send({ message: "Arquivo não enviado." });
    }

    try {
      const resultado = await ContratoService.processarExcel(req.file.buffer);

      const statusFinal = resultado.erros.length > 0 ? 422 : 200;
      let mensagemFinal = `${resultado.sucessos.length} linha(s) processada(s) com sucesso.`;

      if (resultado.erros.length > 0) mensagemFinal += ` ${resultado.erros.length} linha(s) com erros.`;
      if (resultado.avisos.length > 0) mensagemFinal += ` ${resultado.avisos.length} linha(s) com avisos.`;

      return res.status(statusFinal).send({
        message: mensagemFinal,
        summary: {
          sucesso: resultado.sucessos.length,
          falhas: resultado.erros.length,
          avisos: resultado.avisos.length,
        },
        erros: resultado.erros,
        avisos: resultado.avisos,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Erro inesperado ao importar contratos." });
    }
  }
};
