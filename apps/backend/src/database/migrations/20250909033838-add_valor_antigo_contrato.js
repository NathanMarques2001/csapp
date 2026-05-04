"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("contratos", "valor_antigo", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("contratos", "valor_antigo");
  },
};
