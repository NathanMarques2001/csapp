const { Model, DataTypes } = require("sequelize");

class HistoricoCliente extends Model {
    static init(sequelize) {
        super.init(
            {
                data_referencia: DataTypes.DATEONLY,
                id_cliente_original: DataTypes.INTEGER,
                razao_social: DataTypes.STRING,
                nome_fantasia: DataTypes.STRING,
                cpf_cnpj: DataTypes.STRING,
                id_usuario: DataTypes.INTEGER,
                nps: DataTypes.INTEGER,
                id_segmento: DataTypes.INTEGER,
                status: DataTypes.ENUM("ativo", "inativo"),
                id_classificacao_cliente: DataTypes.INTEGER,
                data_criacao: DataTypes.DATE,
                valor_total_contratos: DataTypes.DECIMAL(10, 2),
            },
            {
                sequelize,
                tableName: "historico_clientes",
            }
        );
    }

    static associate(models) {
        this.belongsTo(models.Cliente, {
            foreignKey: "id_cliente_original",
            as: "cliente_atual",
        });
        this.belongsTo(models.Usuario, {
            foreignKey: "id_usuario",
            as: "vendedor",
        });
    }
}

module.exports = HistoricoCliente;
