'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('contratos', 'email_envio');

    await queryInterface.changeColumn('contratos', 'descricao', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.changeColumn('contratos', 'quantidade', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('contratos', 'email_envio', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('contratos', 'descricao', {
      type: Sequelize.TEXT,
      allowNull: false
    });

    await queryInterface.changeColumn('contratos', 'quantidade', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};
