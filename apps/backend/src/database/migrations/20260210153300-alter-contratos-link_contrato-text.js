"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("contratos", "link_contrato", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("contratos", "link_contrato", {
      type: Sequelize.STRING(500), // Reverting to previous state, though data might be truncated
      allowNull: true,
    });
  },
};
