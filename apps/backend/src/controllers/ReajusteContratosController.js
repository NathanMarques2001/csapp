const ReajusteService = require("../services/ReajusteService");

module.exports = {
  async reajustaContratos(req, res) {
    try {
      await ReajusteService.executarReajusteCompleto();
      return res
        .status(200)
        .send({ message: "Reajuste de contratos concluído com sucesso!" });
    } catch (err) {
      console.error(`Erro ao reajustar contratos: ${err.message}`);
      // ReajusteService já faz log interno, mas aqui pegamos erro fatal do processo
      return res.status(500).send({ message: "Erro ao reajustar contratos." });
    }
  },

  // Mantendo exportação de funções individuais se necessário para testes ou rotas específicas,
  // mas idealmente deveriam ser métodos do serviço se forem lógica de negócio.
  // Como o frontend/rotas parecem chamar apenas 'reajustaContratos', vamos simplificar.
};

