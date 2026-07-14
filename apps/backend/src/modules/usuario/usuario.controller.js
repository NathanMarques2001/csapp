const UsuarioService = require('./usuario.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

class UsuarioController {
  login = catchAsync(async (req, res) => {
    const { email, senha } = req.body;
    try {
      const { usuario, token } = await UsuarioService.login(email, senha);
      return res.status(200).send({
        message: 'Usuário logado com sucesso!',
        usuario,
        token,
      });
    } catch (error) {
      const status = error.message === 'E-mail e senha são obrigatórios.' ? 400 : 404;
      throw new AppError(error.message || 'Erro interno', status);
    }
  });

  loginComMicrosoftCallback = catchAsync(async (req, res) => {
    const usuario = req.user;
    if (!usuario) {
      return res.redirect('https://csapp.prolinx.com.br/login');
    }
    try {
      const token = await UsuarioService.gerarToken({
        id: usuario.id,
        nome: usuario.nome,
        tipo: usuario.tipo,
      });
      return res.redirect(`https://csapp.prolinx.com.br/auth/callback?token=${token}`);
    } catch (error) {
      return res.redirect('https://csapp.prolinx.com.br/login');
    }
  });

  index = catchAsync(async (req, res) => {
    const { id } = req.params;
    const usuario = await UsuarioService.findById(id);
    return res.status(200).send({ usuario });
  });

  indexAll = catchAsync(async (req, res) => {
    const usuarios = await UsuarioService.findAll();
    return res.status(200).send({ usuarios });
  });

  store = catchAsync(async (req, res) => {
    const { nome, email, tipo, senha } = req.body;
    const usuario = await UsuarioService.create({ nome, email, tipo, senha });
    return res.status(201).send({
      message: 'Usuário criado com sucesso!',
      usuario,
    });
  });

  update = catchAsync(async (req, res) => {
    const { nome, email, tipo, senha } = req.body;
    const { id } = req.params;
    await UsuarioService.update(id, { nome, email, tipo, senha });
    return res.status(200).send({ message: 'Usuário atualizado com sucesso!' });
  });

  delete = catchAsync(async (req, res) => {
    const { id } = req.params;
    await UsuarioService.delete(id);
    return res.status(200).send({ message: 'Usuário deletado com sucesso!' });
  });
}

module.exports = new UsuarioController();
