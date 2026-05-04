const { Model, DataTypes } = require("sequelize");

class ContratoErroReajuste extends Model {
  static init(sequelize) {
    super.init(
      {
        id_contrato: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        erro: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        tentativas_reajuste: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        tableName: "contratos_erros_reajuste",
      },
    );
  }

  static associate(models) {
    this.belongsTo(models.Contrato, {
      foreignKey: "id_contrato",
      as: "contrato",
    });
  }
}

module.exports = ContratoErroReajuste;
