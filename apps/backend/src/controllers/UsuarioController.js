const Usuario = require("../models/Usuario.js");
const AutenticacaoService = require("../services/AutenticacaoService");

module.exports = {
  async login(req, res) {
    try {
      const { email, senha } = req.body;
      const { usuario, token } = await AutenticacaoService.login(email, senha);

      return res.status(200).send({
        message: "Usuário logado com sucesso!",
        usuario,
        token,
      });
    } catch (error) {
      console.error("Ocorreu um erro no login:", error);
      const status = error.message === "E-mail e senha são obrigatórios." ? 400 : 404;
      return res.status(status).send({ message: error.message || "Erro interno" });
    }
  },

  async loginComMicrosoftCallback(req, res) {
    console.log("----------------------------------------------------");
    console.log("[DEBUG] CHEGUEI NO CONTROLLER PARA GERAR O TOKEN!");
    console.log("[DEBUG] Usuário processado pelo Passport:", req.user?.nome);
    console.log("----------------------------------------------------");
    try {
      const usuario = req.user;

      const token = AutenticacaoService.gerarToken({
        id: usuario.id,
        nome: usuario.nome,
        tipo: usuario.tipo,
      });

      return res.redirect(
        `https://csapp.prolinx.com.br/auth/callback?token=${token}`,
      );
    } catch (error) {
      console.error("Erro no callback do login Microsoft:", error);
      return res.redirect("https://csapp.prolinx.com.br/login");
    }
  },

  async index(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).send({ message: "Usuário não encontrado!" });
      }

      return res.status(200).send({ usuario });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Ocorreu um erro ao buscar o usuário." });
    }
  },

  async indexAll(req, res) {
    try {
      const usuarios = await Usuario.findAll({
        order: [["nome", "ASC"]],
      });

      // if (usuarios.length == 0) {
      //   return res.status(404).send({ message: "Nenhum usuário cadastrado!" });
      // }
      return res.status(200).send({ usuarios });

      return res.status(200).send({ usuarios });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Ocorreu um erro ao buscar os usuários." });
    }
  },

  async store(req, res) {
    try {
      const { nome, email, tipo, senha } = req.body;
      const usuario = await Usuario.create({ nome, email, tipo, senha });

      return res.status(201).send({
        message: "Usuário criado com sucesso!",
        usuario,
      });
    } catch (error) {
      if (error.name == "SequelizeUniqueConstraintError") {
        return res.status(400).send({ message: "E-mail já cadastrado!" });
      }
      console.error(error);
      return res.status(500).send({ message: "Ocorreu um erro ao criar o usuário." });
    }
  },

  async update(req, res) {
    try {
      const { nome, email, tipo, senha } = req.body;
      const { id } = req.params;

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).send({ message: "Usuário não encontrado!" });
      }

      usuario.nome = nome;
      usuario.email = email;
      usuario.tipo = tipo;

      if (senha) {
        usuario.senha = senha;
      }

      await usuario.save();

      return res.status(200).send({ message: "Usuário atualizado com sucesso!" });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Ocorreu um erro ao atualizar o usuário." });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).send({ message: "Usuário não encontrado!" });
      }

      await Usuario.destroy({ where: { id: id } });

      return res.status(200).send({ message: "Usuário deletado com sucesso!" });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Ocorreu um erro ao deletar o usuário." });
    }
  },
};
