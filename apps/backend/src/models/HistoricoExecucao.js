const { Model, DataTypes } = require("sequelize");

class HistoricoExecucao extends Model {
    static init(sequelize) {
        super.init(
            {
                data_referencia: {
                    type: DataTypes.DATEONLY,
                    allowNull: false,
                    unique: true,
                },
                data_inicio_execucao: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
                data_fim_execucao: {
                    type: DataTypes.DATE,
                },
                status: {
                    type: DataTypes.ENUM("EM_EXECUCAO", "SUCESSO", "ERRO"),
                    allowNull: false,
                    defaultValue: "EM_EXECUCAO",
                },
                quantidade_clientes: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0,
                },
                quantidade_contratos: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0,
                },
                mensagem_erro: {
                    type: DataTypes.TEXT,
                },
            },
            {
                sequelize,
                tableName: "historico_execucoes_snapshot",
            }
        );
    }

    static associate(models) {
        // Sem associações por enquanto
    }
}

module.exports = HistoricoExecucao;
