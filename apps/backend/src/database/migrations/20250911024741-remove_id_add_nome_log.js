'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Remove foreign key column id_usuario and add nome_usuario to keep username when a user is deleted
    await queryInterface.removeColumn('logs', 'id_usuario');
    await queryInterface.addColumn('logs', 'nome_usuario', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert: remove nome_usuario and restore id_usuario (as integer FK, nullable to be safe)
    await queryInterface.removeColumn('logs', 'nome_usuario');
    await queryInterface.addColumn('logs', 'id_usuario', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  }
};
