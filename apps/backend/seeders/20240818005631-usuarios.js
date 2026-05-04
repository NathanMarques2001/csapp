const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const usuarios = [];

    for (let i = 1; i <= 10; i++) {
      const nome = `Usuario ${i}`;
      const email = `usuario${i}@example.com`;
      const tipo = i % 2 === 0 ? 'admin' : 'user';
      const senha = '123';

      // Criptografar a senha antes de inserir
      const salt = bcrypt.genSaltSync();
      const senhaCriptografada = bcrypt.hashSync(senha, salt);

      usuarios.push({
        nome,
        email,
        tipo,
        senha: senhaCriptografada,  // Armazena a senha encriptada
        logado: false,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    await queryInterface.bulkInsert('usuarios', usuarios, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};
