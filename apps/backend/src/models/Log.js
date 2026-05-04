const { Model, DataTypes } = require("sequelize");

class Log extends Model {
  static init(sequelize) {
    super.init(
      {
        nome_usuario: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        id_contrato: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        alteracao: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "logs",
      },
    );
  }

  static associate(models) {
  // Logs no longer mantêm referência direta a Usuario (armazenamos o nome em `nome_usuario`)
    this.belongsTo(models.Contrato, {
      foreignKey: "id_contrato",
      as: "contratos",
    });
  }
}

module.exports = Log;
