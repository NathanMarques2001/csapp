"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Comando para alterar a coluna 'senha' da tabela 'usuarios'
    await queryInterface.changeColumn("usuarios", "senha", {
      type: Sequelize.STRING, // Mantenha o tipo de dado
      allowNull: true, // A mudança principal: permitir nulos
    });
  },

  async down(queryInterface, Sequelize) {
    // O método 'down' reverte a alteração, tornando a coluna obrigatória novamente
    await queryInterface.changeColumn("usuarios", "senha", {
      type: Sequelize.STRING,
      allowNull: false, // Reverte para o estado original
    });
  },
};
