module.exports = {
  up: async (queryInterface, Sequelize) => {
    const segmentos = [
      { nome: 'Tecnologia da Informação', status: 'ativo' },
      { nome: 'Saúde', status: 'ativo' },
      { nome: 'Educação', status: 'ativo' },
      { nome: 'Finanças', status: 'ativo' },
      { nome: 'Manufatura', status: 'ativo' },
      { nome: 'Comércio', status: 'ativo' },
      { nome: 'Transporte', status: 'ativo' },
      { nome: 'Energia', status: 'ativo' },
      { nome: 'Telecomunicações', status: 'ativo' },
      { nome: 'Serviços Públicos', status: 'ativo' },
      { nome: 'Segmento Que Será Inativado', status: 'ativo' }
    ];

    const timestamp = new Date();

    segmentos.forEach(segmento => {
      segmento.created_at = timestamp;
      segmento.updated_at = timestamp;
    });

    await queryInterface.bulkInsert('segmentos', segmentos, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('segmentos', null, {});
  }
};
