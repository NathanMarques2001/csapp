const Cliente = require("../models/Cliente");
const ContatoTecnico = require("../models/ContatoTecnico");

module.exports = {
  async index(req, res) {
    try {
      const { id_cliente } = req.params;

      const cliente = await Cliente.findByPk(id_cliente, {
        include: { association: "contatos_tecnicos" },
      });

      if (!cliente) {
        return res.status(404).send({ message: "Cliente não encontrado!" });
      }

      return res
        .status(200)
        .send({ contatos_tecnicos: cliente.contatos_tecnicos });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Erro ao buscar os contatos técnicos." });
    }
  },

  async indexContato(req, res) {
    try {
      const { id } = req.params;

      const contatoTecnico = await ContatoTecnico.findByPk(id);

      if (!contatoTecnico) {
        return res
          .status(404)
          .send({ message: "Contato técnico não encontrado!" });
      }

      return res.status(200).send({ contatoTecnico });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Erro ao buscar o contato técnico." });
    }
  },

  async indexAll(req, res) {
    try {
      const contatosTecnicos = await ContatoTecnico.findAll();

      return res.status(200).send({ contatosTecnicos });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Erro ao buscar os contatos técnicos." });
    }
  },

  async store(req, res) {
    try {
      const { id_cliente, conteudo } = req.body;

      const contatoTecnico = await ContatoTecnico.create({
        id_cliente,
        conteudo,
      });

      return res.status(201).send({
        message: "Contato técnico criado com sucesso!",
        contatoTecnico,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao criar o contato técnico." });
    }
  },

  async update(req, res) {
    try {
      const { conteudo } = req.body;
      const { id } = req.params;

      const contatoTecnico = await ContatoTecnico.findByPk(id);

      if (!contatoTecnico) {
        return res
          .status(404)
          .send({ message: "Contato técnico não encontrado!" });
      }

      ContatoTecnico.update({ conteudo }, { where: { id: id } });

      return res
        .status(200)
        .send({ message: "Contato técnico atualizado com sucesso!" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao atualizar o contato técnico." });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const contatoTecnico = await ContatoTecnico.findByPk(id);

      if (!contatoTecnico) {
        return res
          .status(404)
          .send({ message: "Contato técnico não encontrado!" });
      }

      ContatoTecnico.destroy({ where: { id: id } });

      return res
        .status(200)
        .send({ message: "Contato técnico deletado com sucesso!" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao deletar o contato técnico." });
    }
  },
};
