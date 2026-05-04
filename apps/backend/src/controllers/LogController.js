const Log = require("../models/Log");
const Contrato = require("../models/Contrato");
const Usuario = require("../models/Usuario");

module.exports = {
  async index(req, res) {
    try {
      const { id_contrato } = req.params;

      const contrato = await Contrato.findByPk(id_contrato, {
        include: { association: "logs" },
      });

      if (!contrato) {
        return res.status(404).send({ message: "Contrato não encontrado!" });
      }

      if (contrato.logs.length == 0) {
        return res.status(404).send({ message: "Nenhum log cadastrado!" });
      }

      return res.status(200).send({ logs: contrato.logs });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Erro ao buscar os logs." });
    }
  },

  async indexAll(req, res) {
    try {
      const logs = await Log.findAll();

      if (logs.length == 0) {
        return res.status(404).send({ message: "Nenhum log cadastrado!" });
      }

      return res.status(200).send({ logs });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao buscar os logs." });
    }
  },

  async store(req, res) {
    try {
      let { nome_usuario, id_usuario, id_contrato, alteracao } = req.body;

      if (!nome_usuario && id_usuario) {
        const usuario = await Usuario.findByPk(id_usuario, { attributes: ["nome"] });
        nome_usuario = usuario ? usuario.nome : null;
      }

      if (!nome_usuario) {
        return res.status(400).send({ message: "Nome do usuário é obrigatório." });
      }

      const log = await Log.create({ nome_usuario, id_contrato, alteracao });

      return res.status(201).send({
        message: "Log criado com sucesso!",
        log,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao criar o log." });
    }
  },
};
