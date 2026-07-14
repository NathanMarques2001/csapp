"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("contratos", "tipo_faturamento", {
      type: Sequelize.ENUM("mensal", "anual"),
      defaultValue: "mensal",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("contratos", "tipo_faturamento");
  },
};
