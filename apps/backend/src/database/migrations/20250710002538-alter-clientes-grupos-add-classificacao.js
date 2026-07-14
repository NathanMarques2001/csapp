"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remover coluna 'tipo'
    await queryInterface.removeColumn("clientes", "tipo");
    await queryInterface.removeColumn("grupos_economicos", "tipo");

    // Adicionar coluna 'id_classificacao_cliente'
    await queryInterface.addColumn("clientes", "id_classificacao_cliente", {
      type: Sequelize.INTEGER,
      references: {
        model: "classificacoes_clientes",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn(
      "grupos_economicos",
      "id_classificacao_cliente",
      {
        type: Sequelize.INTEGER,
        references: {
          model: "classificacoes_clientes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    );
  },

  async down(queryInterface, Sequelize) {
    // Reverter as alterações
    await queryInterface.removeColumn("clientes", "id_classificacao_cliente");
    await queryInterface.removeColumn(
      "grupos_economicos",
      "id_classificacao_cliente",
    );

    await queryInterface.addColumn("clientes", "tipo", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("grupos_economicos", "tipo", {
      type: Sequelize.STRING,
    });
  },
};
