const { Model, DataTypes } = require("sequelize");

class Notificacao extends Model {
	static init(sequelize) {
		super.init(
			{
				id_usuario: { type: DataTypes.INTEGER, allowNull: false },
				id_contrato: { type: DataTypes.INTEGER },
				descricao: {
					type: DataTypes.TEXT,
					allowNull: false,
				},
				confirmado_sn: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},
				modulo: {
					type: DataTypes.STRING,
					allowNull: false,
				},
			},
			{
				sequelize,
				tableName: "notificacoes",
			},
		);
	}

	static associate(models) {
		this.belongsTo(models.Usuario, {
			foreignKey: "id_usuario",
			as: "usuarios",
		});
		this.belongsTo(models.Contrato, {
			foreignKey: "id_contrato",
			as: "contratos",
		});
	}
}

module.exports = Notificacao;
