"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const faturados = [
      { nome: "Faturamento Centralizado", status: "ativo" },
      { nome: "Faturamento Regional", status: "ativo" },
      { nome: "Faturamento Terceirizado", status: "inativo" },
      { nome: "Faturamento Matriz", status: "ativo" },
      { nome: "Faturamento Filial", status: "inativo" },
    ].map((f) => ({
      ...f,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert("faturados", faturados, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("faturados", null, {});
  },
};
