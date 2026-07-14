const NotificacaoService = require('./notificacao.service');
const catchAsync = require('../../utils/catchAsync');

class NotificacaoController {
  listar = catchAsync(async (req, res) => {
    const notificacoes = await NotificacaoService.listar();
    return res.json(notificacoes);
  });

  listarAtivas = catchAsync(async (req, res) => {
    const notificacoes = await NotificacaoService.listarAtivas();
    return res.json(notificacoes);
  });

  listarPorUsuario = catchAsync(async (req, res) => {
    const { id_usuario } = req.params;
    const notificacoes = await NotificacaoService.listarPorUsuario(id_usuario);
    return res.json(notificacoes);
  });

  criar = catchAsync(async (req, res) => {
    const { id_usuario, id_contrato, descricao, modulo } = req.body;
    const notificacao = await NotificacaoService.criar({ id_usuario, id_contrato, descricao, modulo });
    return res.status(201).json(notificacao);
  });

  confirmar = catchAsync(async (req, res) => {
    const { id } = req.params;
    const notificacao = await NotificacaoService.confirmar(id);
    return res.json({
      message: 'Notificação confirmada com sucesso',
      notificacao,
    });
  });
}

module.exports = new NotificacaoController();
