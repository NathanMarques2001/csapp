"use strict";

const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");

module.exports = {
  async up(queryInterface, Sequelize) {
    const usuarios = [];

    for (let i = 0; i < 15; i++) {
      const senha = faker.internet.password(8);
      const senhaHash = bcrypt.hashSync(senha, bcrypt.genSaltSync());
      const isMicrosoft = Math.random() < 0.3;

      usuarios.push({
        nome: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        microsoft_oid: isMicrosoft ? faker.string.uuid() : null,
        tipo: faker.helpers.arrayElement(["admin", "comum", "editor"]),
        senha: isMicrosoft ? null : senhaHash,
        logado: faker.datatype.boolean(),
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    await queryInterface.bulkInsert("usuarios", usuarios, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("usuarios", null, {});
  },
};
