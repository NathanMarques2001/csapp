"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable("contratos", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_cliente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "clientes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_produto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "produtos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      faturado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      faturado_por: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dia_vencimento: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      indice_reajuste: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      proximo_reajuste: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      duracao: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      valor_mensal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      email_envio: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable("contratos");
  },
};
