module.exports = {
  up: async (queryInterface, Sequelize) => {
    const clientes = [];
    const cpfsCnpjs = [
      '679.205.940-50', '891.304.720-80', '014.916.480-29', '149.714.020-90', '796.305.410-33',
      '057.914.620-18', '398.762.950-65', '238.289.180-04', '207.790.990-11', '394.496.760-60',
      '103.751.540-22', '164.741.250-14', '343.765.180-44', '749.216.860-00', '622.222.390-20',
      '473.817.240-23', '359.314.520-80', '892.837.290-30', '829.078.370-85', '584.683.980-99',
      '029.574.720-01', '186.543.790-30', '485.762.110-60', '748.859.430-22', '627.014.520-44',
      '437.637.210-00', '237.827.380-50', '753.895.690-11', '975.862.470-05', '206.872.290-19',
      '344.208.600-30', '287.452.750-10', '894.660.530-99', '256.687.140-01', '962.451.920-22',
      '029.612.760-11', '488.995.430-10', '974.450.810-77', '583.901.230-14', '471.259.890-20',
      '813.237.160-00', '583.747.840-45', '978.101.230-30', '205.462.950-89', '876.244.710-01',
      '184.228.920-33', '258.763.110-45', '799.440.950-55', '337.216.340-77', '943.318.750-22'
    ];

    for (let i = 1; i <= 50; i++) {
      const cliente = {
        razao_social: `Razao Social ${i}`,
        nome_fantasia: `Nome Fantasia ${i}`,
        cpf_cnpj: cpfsCnpjs[i - 1],
        id_usuario: i % 10 + 1,  // Assume que existem pelo menos 10 usuários, alternando IDs de 1 a 10
        nps: null,
        data_criacao: new Date(),
        gestor_contratos_nome: `Gestor Contratos ${i}`,
        gestor_contratos_email: `gestor.contratos${i}@example.com`,
        gestor_contratos_nascimento: '1980-01-01',
        gestor_contratos_telefone_1: `+55000000000${i}`,
        gestor_contratos_telefone_2: null,
        gestor_chamados_nome: `Gestor Chamados ${i}`,
        gestor_chamados_email: `gestor.chamados${i}@example.com`,
        gestor_chamados_nascimento: '1980-01-01',
        gestor_chamados_telefone_1: `+55000000000${i}`,
        gestor_chamados_telefone_2: null,
        gestor_financeiro_nome: `Gestor Financeiro ${i}`,
        gestor_financeiro_email: `gestor.financeiro${i}@example.com`,
        gestor_financeiro_nascimento: '1980-01-01',
        gestor_financeiro_telefone_1: `+55000000000${i}`,
        gestor_financeiro_telefone_2: null,
        id_segmento: i % 10 + 1,  // Assume que existem pelo menos 10 segmentos
        status: 'ativo',
        created_at: new Date(),
        updated_at: new Date(),
        tipo: 'c'
      };

      clientes.push(cliente);
    }

    await queryInterface.bulkInsert('clientes', clientes, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('clientes', null, {});
  }
};
