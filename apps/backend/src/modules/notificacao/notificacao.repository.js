const Notificacao = require('../../models/Notificacao');
const Usuario = require('../../models/Usuario');
const Contrato = require('../../models/Contrato');

class NotificacaoRepository {
  get Includes() {
    return [
      {
        model: Usuario,
        as: 'usuarios',
        attributes: ['id', 'nome', 'email'],
      },
      {
        model: Contrato,
        as: 'contratos',
        attributes: ['id', 'descricao', 'data_inicio', 'duracao', 'proximo_reajuste'],
      },
    ];
  }

  async findAll() {
    return await Notificacao.findAll({
      include: this.Includes,
      order: [['created_at', 'DESC']],
    });
  }

  async findAtivas() {
    return await Notificacao.findAll({
      where: { confirmado_sn: false },
      include: this.Includes,
      order: [['created_at', 'DESC']],
    });
  }

  async findByUsuario(id_usuario) {
    return await Notificacao.findAll({
      where: { id_usuario, confirmado_sn: false },
      include: this.Includes,
      order: [['created_at', 'DESC']],
    });
  }

  async findById(id) {
    return await Notificacao.findByPk(id);
  }

  async create(data) {
    return await Notificacao.create(data);
  }

  async confirmar(id) {
    const notif = await Notificacao.findByPk(id);
    if (notif) {
      notif.confirmado_sn = true;
      await notif.save();
    }
    return notif;
  }
}

module.exports = new NotificacaoRepository();
