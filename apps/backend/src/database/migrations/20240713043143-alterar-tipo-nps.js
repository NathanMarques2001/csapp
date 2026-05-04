'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('clientes', 'nps', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('clientes', 'nps', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
