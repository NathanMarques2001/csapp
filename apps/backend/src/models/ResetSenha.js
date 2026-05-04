const { Model, DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

class ResetSenha extends Model {
  static init(sequelize) {
    super.init(
      {
        hash: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        id_usuario: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "reset_senha",
      },
    );

    this.beforeCreate((hashReset) => {
      hashReset.hash = uuidv4();
      hashReset.expires_at = new Date(Date.now() + 60 * 60000); // 60 minutos
    });
  }

  static associate(models) {
    this.belongsTo(models.Usuario, {
      foreignKey: "id_usuario",
      as: "usuarios",
    });
  }
}

module.exports = ResetSenha;
