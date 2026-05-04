module.exports = {
  up: async (queryInterface, Sequelize) => {
    const contatosTecnicos = [];
    const numContatos = 250;  // Número de contatos técnicos a serem inseridos
    const numClientes = 50;  // Supondo que você tenha 50 clientes

    const conteudos = [
      'Solicitação de suporte técnico urgente',
      'Problema com a configuração do sistema',
      'Dúvida sobre funcionalidades específicas',
      'Relato de erro no sistema',
      'Solicitação de manutenção preventiva',
      'Configuração de novos equipamentos',
      'Atualização de software necessária',
      'Problemas de integração com outros sistemas',
      'Pedido de treinamento adicional',
      'Verificação de segurança do sistema'
    ];

    for (let i = 1; i <= numContatos; i++) {
      contatosTecnicos.push({
        id_cliente: (i % numClientes) + 1,  // Alternando entre clientes
        conteudo: conteudos[i % conteudos.length],  // Alternando entre os conteúdos fornecidos no array conteudos
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    return queryInterface.bulkInsert('contatos_tecnicos', contatosTecnicos, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('contatos_tecnicos', null, {});
  }
};
