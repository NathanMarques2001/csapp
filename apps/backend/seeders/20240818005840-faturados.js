module.exports = {
  up: async (queryInterface, Sequelize) => {
    const faturados = [];

    for (let i = 1; i <= 10; i++) {
      faturados.push({
        nome: `Faturado${i}`,
        created_at: new Date(),
        updated_at: new Date(),
        status: 'ativo'
      });
    }

    return queryInterface.bulkInsert('faturados', faturados, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('faturados', null, {});
  }
};
