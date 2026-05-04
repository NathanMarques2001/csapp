const { Model, DataTypes } = require("sequelize");

class Contrato extends Model {
  static init(sequelize) {
    super.init(
      {
        id_cliente: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        id_produto: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        // faturado: {
        //   type: DataTypes.BOOLEAN,
        //   allowNull: false,
        // },
        id_faturado: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        dia_vencimento: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        indice_reajuste: {
          type: DataTypes.FLOAT,
        },
        nome_indice: DataTypes.STRING,
        proximo_reajuste: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          validate: {
            isDate: true,
          },
        },
        status: {
          type: DataTypes.ENUM,
          values: ["ativo", "inativo"],
        },
        duracao: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: {
              args: [0],
              msg: "A duração não pode ser menor que zero.",
            },
          },
        },
        valor_mensal: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          validate: {
            min: {
              args: [0],
              msg: "O valor mensal não pode ser menor que zero.",
            },
          },
        },
        quantidade: {
          type: DataTypes.INTEGER,
          validate: {
            min: {
              args: [0],
              msg: "A quantidade não pode ser menor que zero.",
            },
          },
        },
        descricao: DataTypes.TEXT,
        link_contrato: DataTypes.TEXT,
        data_inicio: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        tipo_faturamento: {
          type: DataTypes.ENUM("mensal", "anual"),
          allowNull: false,
        },
        valor_antigo: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        renovacao_automatica: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: "contratos",
      }
    );
  }

  static associate(models) {
    this.hasMany(models.Log, { foreignKey: "id_contrato", as: "logs" });
    this.hasMany(models.ContratoErroReajuste, {
      foreignKey: "id_contrato",
      as: "erros_reajuste",
    });
    this.hasMany(models.ReprocessamentoContrato, {
      foreignKey: "id_contrato",
      as: "reprocessamentos",
    });
    this.belongsTo(models.Cliente, {
      foreignKey: "id_cliente",
      as: "clientes",
    });
    this.belongsTo(models.Produto, {
      foreignKey: "id_produto",
      as: "produtos",
    });
    this.belongsTo(models.Faturado, {
      foreignKey: "id_faturado",
      as: "faturados",
    });
    this.hasMany(models.VencimentoContratos, {
      foreignKey: "id_contrato",
      as: "vencimento_contratos",
    });
  }
}

module.exports = Contrato;
