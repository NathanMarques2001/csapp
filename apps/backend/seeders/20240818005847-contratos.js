"use strict";

const { faker } = require("@faker-js/faker");

module.exports = {
  async up(queryInterface, Sequelize) {
    const contratos = [];

    const indicesReajuste = [
      { valor: 3.5, nome: "IGP-M" },
      { valor: 5.0, nome: "IPCA" },
      { valor: 6.75, nome: "INPC" },
    ];

    for (let i = 0; i < 200; i++) {
      const indice = faker.helpers.arrayElement(indicesReajuste);

      const dataInicio = faker.date.past({ years: 3 });
      const proximoReajuste = faker.date.future({
        years: 1,
        refDate: dataInicio,
      });

      contratos.push({
        id_cliente: faker.number.int({ min: 1, max: 50 }),
        id_produto: faker.number.int({ min: 1, max: 30 }),
        id_faturado: faker.number.int({ min: 1, max: 5 }),
        faturado: faker.datatype.boolean(),

        dia_vencimento: faker.number.int({ min: 1, max: 28 }),
        indice_reajuste: indice.valor,
        nome_indice: indice.nome,
        proximo_reajuste: proximoReajuste.toISOString().split("T")[0],

        status: faker.helpers.arrayElement(["ativo", "inativo"]),
        duracao: faker.number.int({ min: 6, max: 36 }), // meses
        valor_mensal: faker.finance.amount(150, 5000, 2),
        quantidade: faker.number.int({ min: 1, max: 10 }),

        descricao: faker.lorem.sentences(2),
        data_inicio: dataInicio,

        tipo_faturamento: faker.helpers.arrayElement(["mensal", "anual"]),

        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    await queryInterface.bulkInsert("contratos", contratos, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("contratos", null, {});
  },
};
