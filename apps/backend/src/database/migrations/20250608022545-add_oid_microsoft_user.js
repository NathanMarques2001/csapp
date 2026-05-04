"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("usuarios", "microsoft_oid", {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("usuarios", "microsoft_oid");
  },
};
