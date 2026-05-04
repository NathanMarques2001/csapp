'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const contratos = [];
    const numContratos = 100;
    const numClientes = 50;
    const numProdutos = 10;
    const numFaturado = 10;

    const indices = ['inpc', 'igpm', 'ipc-fipe', 'ipca', null];

    // Função para gerar uma data aleatória entre dois anos
    function getRandomDate(startYear, endYear) {
      const start = new Date(startYear, 0, 1);
      const end = new Date(endYear, 11, 31);
      const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
      const randomDate = new Date(randomTime);

      // Garantir que a data esteja no formato DATEONLY (ano, mês, dia)
      return randomDate.toISOString().split('T')[0]; // Retorna no formato 'YYYY-MM-DD'
    }

    // Função para pegar um elemento aleatório de um array
    function getRandomElement(array) {
      return array[Math.floor(Math.random() * array.length)];
    }

    // Gerar os contratos
    for (let i = 1; i <= numContratos; i++) {
      const id_produto = (i % numProdutos) + 1;
      const quantidade = Math.random() > 0.5 ? Math.floor(Math.random() * 500) + 1 : null;
      const nome_indice = getRandomElement(indices);

      const proximoReajuste = getRandomDate(2010, 2026);

      contratos.push({
        id_cliente: (i % numClientes) + 1,
        id_produto,
        faturado: 0,
        id_faturado: (i % numFaturado) + 1,
        dia_vencimento: (i % 30) + 1,
        indice_reajuste: 5,
        proximo_reajuste: proximoReajuste,
        status: 'ativo',
        duracao: 12 * (i % 3 + 1),
        valor_mensal: 100,
        quantidade,
        descricao: `Descrição do contrato ${i}`,
        nome_indice,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    return queryInterface.bulkInsert('contratos', contratos, {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('contratos', null, {});
  }
};
