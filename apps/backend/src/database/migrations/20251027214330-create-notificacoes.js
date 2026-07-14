'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("notificacoes", {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			id_usuario: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: { model: "usuarios", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			id_contrato: {
				type: Sequelize.INTEGER,
				allowNull: true,
				references: { model: "contratos", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "SET NULL",
			},
			descricao: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			modulo: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			confirmado_sn: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.fn("NOW"),
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.fn("NOW"),
			},
		});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("notificacoes");
  }
};
