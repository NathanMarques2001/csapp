"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("fabricantes", "status", {
      type: Sequelize.ENUM("ativo", "inativo"),
      defaultValue: "ativo",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("fabricantes", "status");
  },
};
