const { validate } = require('uuid');
const ResetSenhaRepository = require('./reset-senha.repository');
const AppError = require('../../utils/AppError');

class ResetSenhaService {
  async solicitarReset(email) {
    const usuario = await ResetSenhaRepository.findUsuarioByEmail(email);
    if (!usuario) {
      throw new AppError('Usuário não encontrado!', 404);
    }
    return await ResetSenhaRepository.createResetToken(usuario.id);
  }

  async resetarSenha(hash, novaSenha) {
    if (!validate(hash)) {
      throw new AppError('Hash inválido!', 400);
    }

    const resetSenha = await ResetSenhaRepository.findByHash(hash);
    if (!resetSenha) {
      throw new AppError('Hash não encontrado!', 404);
    }

    if (resetSenha.used) {
      throw new AppError('Hash já utilizado!', 400);
    }

    if (resetSenha.expires_at < new Date()) {
      await ResetSenhaRepository.deleteToken(resetSenha);
      throw new AppError('Hash expirado!', 400);
    }

    const usuario = await ResetSenhaRepository.findUsuarioById(resetSenha.id_usuario);
    if (!usuario) {
      throw new AppError('Usuário não encontrado!', 404);
    }

    await ResetSenhaRepository.updateUsuarioSenha(usuario, novaSenha);
    await ResetSenhaRepository.deleteToken(resetSenha);

    return true;
  }

  async limparTokensExpirados() {
    return await ResetSenhaRepository.removeExpiredTokens();
  }
}

module.exports = new ResetSenhaService();
