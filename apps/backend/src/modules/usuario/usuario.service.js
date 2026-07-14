const UsuarioRepository = require('./usuario.repository');
const AutenticacaoService = require('../../services/AutenticacaoService');
const AppError = require('../../utils/AppError');

class UsuarioService {
  async login(email, senha) {
    return await AutenticacaoService.login(email, senha);
  }

  async gerarToken(usuarioData) {
    return AutenticacaoService.gerarToken(usuarioData);
  }

  async findAll() {
    return await UsuarioRepository.findAll();
  }

  async findById(id) {
    const usuario = await UsuarioRepository.findById(id);
    if (!usuario) {
      throw new AppError('Usuário não encontrado!', 404);
    }
    return usuario;
  }

  async create(data) {
    try {
      return await UsuarioRepository.create(data);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new AppError('E-mail já cadastrado!', 400);
      }
      throw error;
    }
  }

  async update(id, data) {
    const usuario = await UsuarioRepository.findById(id);
    if (!usuario) {
      throw new AppError('Usuário não encontrado!', 404);
    }
    return await UsuarioRepository.update(usuario, data);
  }

  async delete(id) {
    await this.findById(id);
    await UsuarioRepository.delete(id);
    return true;
  }
}

module.exports = new UsuarioService();
