"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.removeColumn("contratos", "faturado");
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.addColumn("contratos", "faturado", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
  },
};
