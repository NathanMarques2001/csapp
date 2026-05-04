const { Model, DataTypes } = require("sequelize");

class ClassificacaoClientes extends Model {
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
        tipo_categoria: {
          type: DataTypes.ENUM("quantidade", "valor"),
          allowNull: false,
        },
        quantidade: DataTypes.INTEGER,
        valor: DataTypes.DECIMAL(10, 2),
      },
      {
        sequelize,
        tableName: "classificacoes_clientes",
      },
    );
  }

  static associate(models) {
    this.hasMany(models.Cliente, {
      foreignKey: "id_classificacao_cliente",
      as: "clientes",
    });
    this.hasMany(models.GrupoEconomico, {
      foreignKey: "id_classificacao_cliente",
      as: "grupos_economicos",
    });
  }
}

module.exports = ClassificacaoClientes;
