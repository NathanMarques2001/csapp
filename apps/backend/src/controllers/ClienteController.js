const ClienteService = require("../services/ClienteService");

module.exports = {
  async index(req, res) {
    try {
      const { id } = req.params;
      const cliente = await ClienteService.findById(id);

      if (!cliente) {
        return res.status(404).send({ message: "Cliente não encontrado!" });
      }

      return res.status(200).send({ cliente });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Erro ao buscar o cliente." });
    }
  },

  async indexGrupoEconomico(req, res) {
    try {
      const { id } = req.params;
      const clientes = await ClienteService.findByGrupoEconomico(id);

      if (clientes.length === 0) {
        return res.status(404).send({ message: "Nenhum cliente cadastrado!" });
      }

      return res.status(200).send({ clientes });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao buscar os clientes." });
    }
  },

  async indexAll(req, res) {
    try {
      const clientes = await ClienteService.findAll();

      // if (clientes.length === 0) {
      //   return res.status(404).send({ message: "Nenhum cliente cadastrado!" });
      // }
      return res.status(200).send({ clientes });

      return res.status(200).send({ clientes });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Erro ao buscar os clientes." });
    }
  },

  async migrate(req, res) {
    try {
      const { antigo_vendedor, novo_vendedor } = req.body;

      await ClienteService.migrate(antigo_vendedor, novo_vendedor);

      return res
        .status(200)
        .send({ message: "Migração de clientes realizada com sucesso!" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao migrar os clientes." });
    }
  },

  async inactiveOrActive(req, res) {
    try {
      const { id } = req.params;
      const message = await ClienteService.toggleStatus(id);

      return res.status(200).send({ message });
    } catch (error) {
      console.error(error);
      const status = error.message === "Cliente não encontrado!" ? 404 : 500;
      return res.status(status).send({ message: error.message || "Ocorreu um erro ao inativar o cliente." });
    }
  },

  async store(req, res) {
    try {
      const cliente = await ClienteService.create(req.body);

      return res.status(201).send({
        message: "Cliente criado com sucesso!",
        cliente,
      });
    } catch (error) {
      console.error(error);
      if (error.message.includes("inválido")) {
        return res.status(400).send({ message: error.message });
      }
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao criar o cliente." });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      await ClienteService.update(id, req.body);

      return res
        .status(200)
        .send({ message: "Cliente atualizado com sucesso!" });
    } catch (error) {
      console.error(error);
      if (error.message === "Cliente não encontrado!") {
        return res.status(404).send({ message: error.message });
      }
      if (error.message.includes("inválido")) {
        return res.status(400).send({ message: error.message });
      }
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao atualizar o cliente." });
    }
  },

  async gestoresComNascimento(req, res) {
    try {
      const clientes = await ClienteService.findGestoresComNascimento();

      if (!clientes || clientes.length === 0) {
        return res.status(404).send({ message: "Nenhum cliente encontrado!" });
      }

      return res.status(200).send({ clientes });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Erro ao buscar clientes com data de nascimento dos gestores." });
    }
  },
};
