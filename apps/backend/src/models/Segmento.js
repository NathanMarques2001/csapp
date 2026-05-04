const { Model, DataTypes } = require("sequelize");

class Segmento extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        status: {
          type: DataTypes.ENUM,
          values: ["ativo", "inativo"],
        },
      },
      {
        sequelize,
        tableName: "segmentos",
      },
    );
  }

  static associate(models) {
    this.hasMany(models.Cliente, { foreignKey: "id_segmento", as: "clientes" });
  }
}

module.exports = Segmento;
