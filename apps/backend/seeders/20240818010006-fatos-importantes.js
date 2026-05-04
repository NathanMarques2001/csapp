"use strict";

const { faker } = require("@faker-js/faker");

module.exports = {
  async up(queryInterface, Sequelize) {
    const fatos = [];

    for (let i = 0; i < 40; i++) {
      fatos.push({
        id_cliente: faker.number.int({ min: 1, max: 50 }),
        conteudo: faker.lorem.paragraph(),
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    await queryInterface.bulkInsert("fatos_importantes", fatos, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("fatos_importantes", null, {});
  },
};
