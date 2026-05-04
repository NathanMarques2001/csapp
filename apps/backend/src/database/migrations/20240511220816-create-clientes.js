"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable("clientes", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      razao_social: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      nome_fantasia: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cpf_cnpj: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      nps: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      segmento: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      data_criacao: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      gestor_contratos_nome: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gestor_contratos_email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gestor_contratos_nascimento: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      gestor_contratos_telefone_1: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gestor_contratos_telefone_2: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gestor_chamados_nome: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gestor_chamados_email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gestor_chamados_nascimento: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      gestor_chamados_telefone_1: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gestor_chamados_telefone_2: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gestor_financeiro_nome: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gestor_financeiro_email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gestor_financeiro_nascimento: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      gestor_financeiro_telefone_1: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gestor_financeiro_telefone_2: {
        type: Sequelize.STRING,
        allowNull: true,
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
    return queryInterface.dropTable("clientes");
  },
};
