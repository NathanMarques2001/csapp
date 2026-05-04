"use strict";

const { faker } = require("@faker-js/faker");

module.exports = {
  async up(queryInterface, Sequelize) {
    const contatos = [];

    for (let i = 0; i < 40; i++) {
      contatos.push({
        id_cliente: faker.number.int({ min: 1, max: 50 }),
        conteudo: faker.lorem.paragraph(),
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    await queryInterface.bulkInsert("contatos_comerciais", contatos, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("contatos_comerciais", null, {});
  },
};
