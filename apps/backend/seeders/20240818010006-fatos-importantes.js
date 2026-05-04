module.exports = {
  up: async (queryInterface, Sequelize) => {
    const fatosImportantes = [];
    const numFatos = 200;  // Número de fatos importantes a serem inseridos
    const numClientes = 50;  // Supondo que você tenha 50 clientes

    const conteudos = [
      'Reunião de estratégia realizada com sucesso.',
      'Cliente solicitou uma análise de mercado detalhada.',
      'Atualização importante sobre mudanças regulatórias.',
      'Feedback positivo sobre o último projeto entregue.',
      'Identificado potencial para novos negócios na área X.',
      'Necessidade de revisão de contrato discutida.',
      'Cliente expressou interesse em novos produtos.',
      'Problema crítico solucionado com sucesso.',
      'Solicitação de expansão dos serviços para nova região.',
      'Reunião para discutir aumento de orçamento.'
    ];

    for (let i = 1; i <= numFatos; i++) {
      fatosImportantes.push({
        id_cliente: (i % numClientes) + 1,  // Alternando entre clientes
        conteudo: conteudos[i % conteudos.length],  // Alternando entre os conteúdos fornecidos no array conteudos
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    return queryInterface.bulkInsert('fatos_importantes', fatosImportantes, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('fatos_importantes', null, {});
  }
};
