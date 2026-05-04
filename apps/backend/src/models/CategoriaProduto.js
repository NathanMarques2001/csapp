const { Model, DataTypes } = require("sequelize");

class CategoriaProduto extends Model {
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
          defaultValue: "ativo",
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "categorias_produtos",
      },
    );
  }

  static associate(models) {
    this.hasMany(models.Produto, {
      foreignKey: "id_categoria_produto",
      as: "produtos",
    });
  }
}

module.exports = CategoriaProduto;
