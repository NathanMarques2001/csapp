const { Model, DataTypes } = require("sequelize");

class HistoricoContrato extends Model {
    static init(sequelize) {
        super.init(
            {
                data_referencia: DataTypes.DATEONLY,
                id_contrato_original: DataTypes.INTEGER,
                id_cliente: DataTypes.INTEGER,
                id_produto: DataTypes.INTEGER,
                id_faturado: DataTypes.INTEGER,
                status: DataTypes.ENUM("ativo", "inativo"),
                valor_mensal: DataTypes.DECIMAL(10, 2),
                quantidade: DataTypes.INTEGER,
                data_inicio: DataTypes.DATE,
                data_vencimento_calculada: DataTypes.DATEONLY,
            },
            {
                sequelize,
                tableName: "historico_contratos",
            }
        );
    }

    static associate(models) {
        this.belongsTo(models.Contrato, {
            foreignKey: "id_contrato_original",
            as: "contrato_atual",
        });
        this.belongsTo(models.Cliente, {
            foreignKey: "id_cliente",
            as: "cliente",
        });
        this.belongsTo(models.Produto, {
            foreignKey: "id_produto",
            as: "produto",
        });
    }
}

module.exports = HistoricoContrato;
