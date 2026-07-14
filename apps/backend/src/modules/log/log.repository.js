const Log = require('../../models/Log');
const Contrato = require('../../models/Contrato');
const Usuario = require('../../models/Usuario');

class LogRepository {
  async findAll() {
    return await Log.findAll();
  }

  async findContratoWithLogs(id_contrato) {
    return await Contrato.findByPk(id_contrato, {
      include: { association: 'logs' },
    });
  }

  async findUsuarioNomeById(id_usuario) {
    const usuario = await Usuario.findByPk(id_usuario, { attributes: ['nome'] });
    return usuario ? usuario.nome : null;
  }

  async create(data) {
    return await Log.create(data);
  }
}

module.exports = new LogRepository();
