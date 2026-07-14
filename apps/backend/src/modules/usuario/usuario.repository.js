const Usuario = require('../../models/Usuario');

class UsuarioRepository {
  async findAll() {
    return await Usuario.findAll({
      order: [['nome', 'ASC']],
    });
  }

  async findById(id) {
    return await Usuario.findByPk(id);
  }

  async findByEmail(email) {
    return await Usuario.findOne({ where: { email } });
  }

  async create(data) {
    return await Usuario.create(data);
  }

  async update(usuario, data) {
    usuario.nome = data.nome;
    usuario.email = data.email;
    usuario.tipo = data.tipo;
    if (data.senha) {
      usuario.senha = data.senha;
    }
    await usuario.save();
    return usuario;
  }

  async delete(id) {
    return await Usuario.destroy({ where: { id } });
  }
}

module.exports = new UsuarioRepository();
