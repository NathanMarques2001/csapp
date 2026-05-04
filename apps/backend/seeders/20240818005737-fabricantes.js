"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const fabricantes = [
      { nome: "Dell Technologies", status: "ativo" },
      { nome: "HP Inc.", status: "ativo" },
      { nome: "Lenovo Group", status: "ativo" },
      { nome: "AsusTek Computer", status: "ativo" },
      { nome: "Acer Incorporated", status: "inativo" },
      { nome: "Samsung Electronics", status: "ativo" },
      { nome: "Apple Inc.", status: "ativo" },
      { nome: "LG Electronics", status: "inativo" },
      { nome: "Intel Corporation", status: "ativo" },
      { nome: "AMD (Advanced Micro Devices)", status: "ativo" },
    ].map((fab) => ({
      ...fab,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert("fabricantes", fabricantes, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("fabricantes", null, {});
  },
};
