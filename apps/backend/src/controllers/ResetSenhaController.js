const { Op } = require("sequelize");
const { validate } = require("uuid");
const ResetSenha = require("../models/ResetSenha");
const Usuario = require("../models/Usuario");

module.exports = {
  async store(req, res) {
    try {
      const { email } = req.body;

      const usuario = await Usuario.findOne({ where: { email: email } });

      if (!usuario) {
        return res.status(404).send({ message: "Usuário não encontrado!" });
      }

      const resetSenha = await ResetSenha.create({ id_usuario: usuario.id });

      return res.status(201).send({
        message: "E-mail de recuperação de senha enviado com sucesso!",
        resetSenha,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        message: "Ocorreu um erro ao enviar o e-mail de recuperação de senha.",
      });
    }
  },

  async reset(req, res) {
    try {
      const { hash, senha } = req.body;

      if (!validate(hash)) {
        return res.status(400).send({ message: "Hash inválido!" });
      }

      const resetSenha = await ResetSenha.findOne({ where: { hash: hash } });

      if (!resetSenha) {
        return res.status(404).send({ message: "Hash não encontrado!" });
      }

      if (resetSenha.used) {
        return res.status(400).send({ message: "Hash já utilizado!" });
      }

      if (resetSenha.expires_at < new Date()) {
        await resetSenha.destroy();
        return res.status(400).send({ message: "Hash expirado!" });
      }

      const usuario = await Usuario.findByPk(resetSenha.id_usuario);

      if (!usuario) {
        return res.status(404).send({ message: "Usuário não encontrado!" });
      }

      await usuario.update({ senha: senha });
      await resetSenha.destroy();

      return res.status(200).send({ message: "Senha alterada com sucesso!" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao alterar a senha." });
    }
  },

  async removeExpiredTokens(req, res) {
    try {
      // Apaga registros expirados
      await ResetSenha.destroy({
        where: {
          expires_at: { [Op.lt]: new Date() },
        },
      });

      return res
        .status(200)
        .send({ message: "Registros expirados apagados com sucesso!" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao listar os registros." });
    }
  },
};
