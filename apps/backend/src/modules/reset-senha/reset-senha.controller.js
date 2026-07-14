const ResetSenhaService = require('./reset-senha.service');
const catchAsync = require('../../utils/catchAsync');

class ResetSenhaController {
  store = catchAsync(async (req, res) => {
    const { email } = req.body;
    const resetSenha = await ResetSenhaService.solicitarReset(email);
    
    return res.status(201).send({
      message: 'E-mail de recuperação de senha enviado com sucesso!',
      resetSenha,
    });
  });

  reset = catchAsync(async (req, res) => {
    const { hash, senha } = req.body;
    await ResetSenhaService.resetarSenha(hash, senha);
    
    return res.status(200).send({ message: 'Senha alterada com sucesso!' });
  });

  removeExpiredTokens = catchAsync(async (req, res) => {
    await ResetSenhaService.limparTokensExpirados();
    return res.status(200).send({ message: 'Registros expirados apagados com sucesso!' });
  });
}

module.exports = new ResetSenhaController();
