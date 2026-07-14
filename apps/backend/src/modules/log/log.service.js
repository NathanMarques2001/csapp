const LogRepository = require('./log.repository');
const AppError = require('../../utils/AppError');

class LogService {
  async findByContratoId(id_contrato) {
    const contrato = await LogRepository.findContratoWithLogs(id_contrato);
    if (!contrato) {
      throw new AppError('Contrato não encontrado!', 404);
    }
    if (!contrato.logs || contrato.logs.length === 0) {
      throw new AppError('Nenhum log cadastrado!', 404);
    }
    return contrato.logs;
  }

  async findAll() {
    const logs = await LogRepository.findAll();
    if (!logs || logs.length === 0) {
      throw new AppError('Nenhum log cadastrado!', 404);
    }
    return logs;
  }

  async create(data) {
    let { nome_usuario, id_usuario, id_contrato, alteracao } = data;

    if (!nome_usuario && id_usuario) {
      nome_usuario = await LogRepository.findUsuarioNomeById(id_usuario);
    }

    if (!nome_usuario) {
      throw new AppError('Nome do usuário é obrigatório.', 400);
    }

    const log = await LogRepository.create({ nome_usuario, id_contrato, alteracao });
    return log;
  }
}

module.exports = new LogService();
