module.exports = {
  up: async (queryInterface, Sequelize) => {
    const fabricantes = [];

    for (let i = 1; i <= 10; i++) {
      fabricantes.push({
        nome: `Fabricante${i}`,
        created_at: new Date(),
        updated_at: new Date(),
        status: 'ativo'
      });
    }

    return queryInterface.bulkInsert('fabricantes', fabricantes, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('fabricantes', null, {});
  }
};
