module.exports = {
  up: async (queryInterface, Sequelize) => {
    const contatosComerciais = [];
    const numContatos = 300;  // Número de contatos comerciais a serem inseridos
    const numClientes = 50;  // Supondo que você tenha 50 clientes

    const conteudos = [
      'Consulta sobre o contrato de manutenção',
      'Solicitação de informações sobre novos produtos',
      'Reunião para revisão de contrato',
      'Dúvidas sobre faturamento',
      'Proposta de atualização de contrato',
      'Confirmação de recebimento de documentação',
      'Discussão sobre termos de serviço',
      'Pedido de suporte técnico',
      'Negociação de preços e condições',
      'Feedback sobre o serviço recebido'
    ];

    for (let i = 1; i <= numContatos; i++) {
      contatosComerciais.push({
        id_cliente: (i % numClientes) + 1,  // Alternando entre clientes
        conteudo: conteudos[i % conteudos.length],  // Alternando entre os conteúdos fornecidos no array conteudos
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    return queryInterface.bulkInsert('contatos_comerciais', contatosComerciais, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('contatos_comerciais', null, {});
  }
};
