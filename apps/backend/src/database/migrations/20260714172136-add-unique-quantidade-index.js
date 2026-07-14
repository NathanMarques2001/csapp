'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Adiciona o índice único parcial no MySQL 8.0 usando índices funcionais.
    // Isso garante que apenas um registro possa ter tipo_categoria = 'quantidade'.
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX idx_unica_classificacao_quantidade 
      ON classificacoes_clientes ((CASE WHEN tipo_categoria = 'quantidade' THEN 1 ELSE NULL END));
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX idx_unica_classificacao_quantidade ON classificacoes_clientes;
    `);
  }
};
