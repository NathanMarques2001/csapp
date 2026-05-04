"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Altera as colunas existentes
    await queryInterface.changeColumn("clientes", "gestor_contratos_nome", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("clientes", "gestor_contratos_email", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn(
      "clientes",
      "gestor_contratos_nascimento",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    await queryInterface.changeColumn(
      "clientes",
      "gestor_contratos_telefone_1",
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
    );

    await queryInterface.changeColumn(
      "clientes",
      "gestor_contratos_telefone_2",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    await queryInterface.changeColumn("clientes", "gestor_chamados_nome", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn("clientes", "gestor_chamados_email", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn(
      "clientes",
      "gestor_chamados_nascimento",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    await queryInterface.changeColumn(
      "clientes",
      "gestor_chamados_telefone_1",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    await queryInterface.changeColumn(
      "clientes",
      "gestor_chamados_telefone_2",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    await queryInterface.changeColumn("clientes", "gestor_financeiro_nome", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn("clientes", "gestor_financeiro_email", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn(
      "clientes",
      "gestor_financeiro_nascimento",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    await queryInterface.changeColumn(
      "clientes",
      "gestor_financeiro_telefone_1",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    await queryInterface.changeColumn(
      "clientes",
      "gestor_financeiro_telefone_2",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    // Adiciona a coluna 'tipo'
    await queryInterface.addColumn("clientes", "tipo", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Permite nulo na coluna 'nps'
    await queryInterface.changeColumn("clientes", "nps", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove a coluna 'tipo'
    await queryInterface.removeColumn("clientes", "tipo");

    // Reverte as alterações nas colunas
    await queryInterface.changeColumn("clientes", "gestor_contratos_nome", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("clientes", "gestor_contratos_email", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn(
      "clientes",
      "gestor_contratos_nascimento",
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
    );

    await queryInterface.changeColumn(
      "clientes",
      "gestor_contratos_telefone_1",
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
    );

    await queryInterface.changeColumn(
      "clientes",
      "gestor_contratos_telefone_2",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    await queryInterface.changeColumn("clientes", "gestor_chamados_nome", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("clientes", "gestor_chamados_email", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn(
      "clientes",
      "gestor_chamados_nascimento",
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
    );

    await queryInterface.changeColumn(
      "clientes",
      "gestor_chamados_telefone_1",
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
    );

    await queryInterface.changeColumn(
      "clientes",
      "gestor_chamados_telefone_2",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    await queryInterface.changeColumn("clientes", "gestor_financeiro_nome", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("clientes", "gestor_financeiro_email", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn(
      "clientes",
      "gestor_financeiro_nascimento",
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
    );

    await queryInterface.changeColumn(
      "clientes",
      "gestor_financeiro_telefone_1",
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
    );

    await queryInterface.changeColumn(
      "clientes",
      "gestor_financeiro_telefone_2",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    // Reverte a alteração na coluna 'nps'
    await queryInterface.changeColumn("clientes", "nps", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
