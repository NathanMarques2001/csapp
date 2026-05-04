const VencimentoContratos = require("../models/VencimentoContratos");
const Contrato = require("../models/Contrato");
const Cliente = require("../models/Cliente");
const Usuario = require("../models/Usuario");
const { Op } = require("sequelize");

module.exports = {
  async getAll(req, res) {
    try {
      const vencimentos = await VencimentoContratos.findAll();
      res.status(200).json({ vencimentos });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getToday(req, res) {
    try {
      const today = new Date();
      let startOfDay = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      );
      let endOfDay = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
          23,
          59,
          59,
          999,
        ),
      );


      const vencimentos = await VencimentoContratos.findAll({
        where: {
          data_vencimento: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      res.status(200).json({ vencimentos });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async emailData(req, res) {
    try {
      const { id_contrato } = req.params;
      const contrato = await Contrato.findByPk(id_contrato);

      if (!contrato) {
        return res.status(404).json({ message: "Contrato não encontrado" });
      }

      const cliente = await Cliente.findByPk(contrato.id_cliente);
      const usuario = await Usuario.findByPk(cliente.id_usuario);

      res.status(200).json({
        usuario_nome: usuario.nome,
        usuario_email: usuario.email,
        cliente_nome: cliente.nome_fantasia,
        cliente_cnpj: cliente.cpf_cnpj,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { id_contrato, status, data_vencimento } = req.body;
      const contrato = await Contrato.findByPk(id_contrato);

      if (!contrato) {
        return res.status(404).json({ message: "Contrato não encontrado" });
      }

      const novoVencimento = await VencimentoContratos.create({
        id_contrato,
        status,
        data_vencimento,
      });

      res.status(201).json(novoVencimento);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      let { status, data_vencimento } = req.body;

      const vencimento = await VencimentoContratos.findByPk(id);
      if (!vencimento) {
        return res.status(404).json({ message: "Vencimento não encontrado" });
      }

      await vencimento.update({ status, data_vencimento });

      res.status(200).json(vencimento);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const vencimento = await VencimentoContratos.findByPk(id);
      if (!vencimento) {
        return res.status(404).json({ message: "Vencimento não encontrado" });
      }

      await vencimento.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
