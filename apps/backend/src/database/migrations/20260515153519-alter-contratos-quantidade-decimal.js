"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("contratos", "quantidade", {
      type: Sequelize.DECIMAL(10, 1),
      allowNull: true,
      validate: {
        min: 0,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("contratos", "quantidade", {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    });
  },
};
