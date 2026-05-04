module.exports = {
  up: async (queryInterface, Sequelize) => {
    const produtos = [];
    const numProdutos = 10;
    const numFabricantes = 10;

    for (let i = 1; i <= numProdutos; i++) {
      const nome = (i === 1) ? 'Antivírus' : (i === 2) ? 'ProBackup' : `Produto${i}`;

      produtos.push({
        nome,
        id_fabricante: (i % numFabricantes) + 1,  // Associa produtos aos fabricantes 1 a 10
        status: 'ativo',
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    return queryInterface.bulkInsert('produtos', produtos, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('produtos', null, {});
  }
};
