const NotificacaoRepository = require('./notificacao.repository');
const AppError = require('../../utils/AppError');

class NotificacaoService {
  async listar() {
    return await NotificacaoRepository.findAll();
  }

  async listarAtivas() {
    return await NotificacaoRepository.findAtivas();
  }

  async listarPorUsuario(id_usuario) {
    if (!id_usuario) {
      throw new AppError('ID do usuário não informado', 400);
    }
    return await NotificacaoRepository.findByUsuario(id_usuario);
  }

  async criar(data) {
    const { id_usuario, descricao, modulo } = data;
    if (!id_usuario || !descricao || !modulo) {
      throw new AppError('Campos obrigatórios não preenchidos', 400);
    }
    return await NotificacaoRepository.create(data);
  }

  async confirmar(id) {
    const notif = await NotificacaoRepository.findById(id);
    if (!notif) {
      throw new AppError('Notificação não encontrada', 404);
    }
    return await NotificacaoRepository.confirmar(id);
  }
}

module.exports = new NotificacaoService();
