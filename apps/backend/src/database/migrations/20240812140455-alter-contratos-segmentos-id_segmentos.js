"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("clientes", "segmento");

    await queryInterface.addColumn("clientes", "id_segmento", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "segmentos",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("clientes", "segmento", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.removeColumn("clientes", "id_segmento");
  },
};
