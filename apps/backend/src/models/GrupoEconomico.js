const { Model, DataTypes } = require("sequelize");

class GrupoEconomico extends Model {
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
        id_classificacao_cliente: {
          type: DataTypes.INTEGER,
          references: {
            model: "classificacoes_clientes",
            key: "id",
          },
        },
      },
      {
        sequelize,
        tableName: "grupos_economicos",
      },
    );
  }

  static associate(models) {
    this.hasMany(models.Cliente, {
      foreignKey: "id_grupo_economico",
      as: "clientes",
    });
    this.belongsTo(models.ClassificacaoClientes, {
      foreignKey: "id_classificacao_cliente",
      as: "classificacao",
    });
  }
}

module.exports = GrupoEconomico;
