const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

class Usuario extends Model {
  static init(sequelize) {
    super.init({
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3],
            msg: 'O nome deve ter mais de 3 caracteres.'
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: {
            msg: 'O e-mail fornecido não é válido.'
          }
        },
        unique: true
      },
      microsoft_oid: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true
      },
      tipo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      senha: {
        type: DataTypes.STRING,
        allowNull: true
      },
      logado: DataTypes.BOOLEAN
    }, {
      sequelize,
      tableName: 'usuarios',
      hooks: {
        beforeCreate: (usuario) => {
          // Correto: só executa se houver uma senha para criptografar
          if (usuario.senha) {
            const salt = bcrypt.genSaltSync();
            usuario.senha = bcrypt.hashSync(usuario.senha, salt);
          }
        },
        beforeUpdate: async (usuario) => {
          if (usuario.changed('senha')) {
            const salt = await bcrypt.genSalt();
            usuario.senha = await bcrypt.hash(usuario.senha, salt);
          }
        }
      }
    });
  }

  static associate(models) {
    this.hasMany(models.Log, { foreignKey: 'id_usuario', as: 'logs' });
    this.hasMany(models.Cliente, { foreignKey: 'id_usuario', as: 'clientes' });
    this.hasMany(models.ResetSenha, { foreignKey: 'id_usuario', as: 'reset_senha' });
  }
}

module.exports = Usuario;
