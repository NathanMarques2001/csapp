const { Op } = require('sequelize');
const ResetSenha = require('../../models/ResetSenha');
const Usuario = require('../../models/Usuario');

class ResetSenhaRepository {
  async findUsuarioByEmail(email) {
    return await Usuario.findOne({ where: { email } });
  }

  async findUsuarioById(id) {
    return await Usuario.findByPk(id);
  }

  async createResetToken(id_usuario) {
    return await ResetSenha.create({ id_usuario });
  }

  async findByHash(hash) {
    return await ResetSenha.findOne({ where: { hash } });
  }

  async deleteToken(resetSenha) {
    return await resetSenha.destroy();
  }

  async updateUsuarioSenha(usuario, senha) {
    return await usuario.update({ senha });
  }

  async removeExpiredTokens() {
    return await ResetSenha.destroy({
      where: {
        expires_at: { [Op.lt]: new Date() },
      },
    });
  }
}

module.exports = new ResetSenhaRepository();
