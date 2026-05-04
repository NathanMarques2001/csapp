"use strict";

const { faker } = require("@faker-js/faker");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Cria os 10 grupos econômicos
    const grupos = [
      { nome: "Grupo Econômico Alpha", status: "ativo", tipo: "Matriz" },
      { nome: "Grupo Econômico Beta", status: "ativo", tipo: "Matriz" },
      { nome: "Grupo Econômico Gama", status: "inativo", tipo: "Filial" },
      { nome: "Grupo Econômico Delta", status: "ativo", tipo: "Matriz" },
      { nome: "Grupo Econômico Épsilon", status: "ativo", tipo: "Filial" },
      { nome: "Grupo Econômico Zeta", status: "inativo", tipo: "Matriz" },
      { nome: "Grupo Econômico Eta", status: "ativo", tipo: "Filial" },
      { nome: "Grupo Econômico Teta", status: "ativo", tipo: "Matriz" },
      { nome: "Grupo Econômico Iota", status: "ativo", tipo: "Filial" },
      { nome: "Grupo Econômico Kappa", status: "ativo", tipo: "Matriz" },
    ].map((grupo) => ({
      ...grupo,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert("grupos_economicos", grupos, {});

    // Agora cria os 50 clientes
    const clientes = [];

    for (let i = 0; i < 50; i++) {
      const tipoUnidade = faker.helpers.arrayElement(["pai", "filha"]);
      const status = faker.helpers.arrayElement(["ativo", "inativo"]);

      clientes.push({
        razao_social: faker.company.name() + " LTDA",
        nome_fantasia: faker.company.name(),
        cpf_cnpj: faker.number
          .int({ min: 10000000000000, max: 99999999999999 })
          .toString(),
        id_usuario: faker.number.int({ min: 1, max: 15 }),
        id_segmento: faker.number.int({ min: 1, max: 10 }),
        id_grupo_economico: faker.number.int({ min: 1, max: 10 }),

        nps: faker.number.int({ min: 0, max: 10 }),
        status,
        tipo: faker.helpers.arrayElement(["cliente", "parceiro", "interno"]),
        tipo_unidade: tipoUnidade,
        data_criacao: faker.date.past({ years: 5 }),

        gestor_contratos_nome: faker.person.fullName(),
        gestor_contratos_email: faker.internet.email().toLowerCase(),
        gestor_contratos_nascimento: faker.date
          .birthdate({ min: 25, max: 60, mode: "age" })
          .toISOString()
          .split("T")[0],
        gestor_contratos_telefone_1: faker.phone.number("(##) #####-####"),
        gestor_contratos_telefone_2: faker.phone.number("(##) #####-####"),

        gestor_chamados_nome: faker.person.fullName(),
        gestor_chamados_email: faker.internet.email().toLowerCase(),
        gestor_chamados_nascimento: faker.date
          .birthdate({ min: 20, max: 50, mode: "age" })
          .toISOString()
          .split("T")[0],
        gestor_chamados_telefone_1: faker.phone.number("(##) #####-####"),
        gestor_chamados_telefone_2: faker.phone.number("(##) #####-####"),

        gestor_financeiro_nome: faker.person.fullName(),
        gestor_financeiro_email: faker.internet.email().toLowerCase(),
        gestor_financeiro_nascimento: faker.date
          .birthdate({ min: 30, max: 65, mode: "age" })
          .toISOString()
          .split("T")[0],
        gestor_financeiro_telefone_1: faker.phone.number("(##) #####-####"),
        gestor_financeiro_telefone_2: faker.phone.number("(##) #####-####"),

        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    await queryInterface.bulkInsert("clientes", clientes, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("clientes", null, {});
    await queryInterface.bulkDelete("grupos_economicos", null, {});
  },
};
