'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('contratos', 'faturado_por');

    await queryInterface.addColumn('contratos', 'id_faturado', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'faturados',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('contratos', 'faturado_por', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.removeColumn('contratos', 'id_faturado');
  },
};
