const Cliente = require("../models/Cliente");
const GrupoEconomico = require("../models/GrupoEconomico");
const Contrato = require("../models/Contrato");
const classificarClientes = require("../utils/classificacaoClientes");

module.exports = {
  async index(req, res) {
    try {
      const { id } = req.params;
      const grupoEconomico = await GrupoEconomico.findByPk(id);

      if (!grupoEconomico) {
        return res
          .status(404)
          .send({ message: "Grupo econômico não encontrado!" });
      }

      return res.status(200).send({ grupoEconomico });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao buscar o grupo econômico." });
    }
  },

  async indexAll(req, res) {
    try {
      const grupoEconomico = await GrupoEconomico.findAll({
        order: [["nome", "ASC"]],
      });

      return res.status(200).send({ grupoEconomico });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao buscar os grupos econômicos." });
    }
  },

  async inactiveOrActive(req, res) {
    try {
      const { id } = req.params;

      const grupoEconomico = await GrupoEconomico.findByPk(id);

      if (!grupoEconomico) {
        return res.status(404).send({ message: "Grupo econômico não encontrado!" });
      }

      if (grupoEconomico.status === "ativo") {
        await GrupoEconomico.update(
          { status: "inativo" },
          { where: { id: id } },
        );

        const clientes = await Cliente.findAll({
          where: { id_grupo_economico: id },
        });

        for (const cliente of clientes) {
          if (cliente.status === "ativo") {
            await Cliente.update(
              { status: "inativo" },
              { where: { id: cliente.id } },
            );
            await Contrato.update(
              { status: "inativo" },
              { where: { id_cliente: cliente.id } },
            );
          }
        }
        await classificarClientes();
      } else {
        await GrupoEconomico.update({ status: "ativo" }, { where: { id: id } });
      }

      return res.status(200).send({
        message:
          "Status alterado com sucesso!",
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao alterar status do grupo econômico." });
    }
  },

  async store(req, res) {
    try {
      const { nome } = req.body;

      const grupoEconomico = await GrupoEconomico.create({
        nome,
        status: 'ativo'
      });

      return res.status(201).send({
        message: "Grupo econômico criado com sucesso!",
        grupoEconomico,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao criar o grupo econômico." });
    }
  },

  async update(req, res) {
    try {
      const { nome, status } = req.body;
      const { id } = req.params;

      const grupoEconomico = await GrupoEconomico.findByPk(id);

      if (!grupoEconomico) {
        return res
          .status(404)
          .send({ message: "Grupo econômico não encontrado!" });
      }

      await GrupoEconomico.update({ nome, status }, { where: { id: id } });

      return res.status(200).send({ message: "Grupo econômico atualizado com sucesso!" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao atualizar o grupo econômico." });
    }
  },
};
