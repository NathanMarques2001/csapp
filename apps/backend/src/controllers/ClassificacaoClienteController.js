const ClassificacaoCliente = require("../models/ClassificacaoCliente");
const classificarClientes = require("../utils/classificacaoClientes");

module.exports = {
  async index(req, res) {
    try {
      const classificacoesQuantidade = await ClassificacaoCliente.findAll({
        where: { tipo_categoria: "quantidade" },
        order: [["nome", "ASC"]],
      });

      const classificacoesValor = await ClassificacaoCliente.findAll({
        where: { tipo_categoria: "valor" },
        order: [["valor", "DESC"]],
      });

      const classificacoes = [
        ...classificacoesQuantidade,
        ...classificacoesValor,
      ];

      if (classificacoes.length === 0) {
        return res
          .status(404)
          .send({ message: "Nenhuma classificação cadastrada." });
      }

      return res.status(200).send({ classificacoes });
    } catch (error) {
      console.error("Erro ao buscar classificações:", error);
      return res.status(500).send({
        message: "Erro interno ao buscar classificações.",
      });
    }
  },

  async show(req, res) {
    try {
      const { id } = req.params;
      const classificacao = await ClassificacaoCliente.findByPk(id);

      if (!classificacao) {
        return res
          .status(404)
          .send({ message: "Classificação não encontrada." });
      }

      return res.status(200).send({ classificacao });
    } catch (error) {
      console.error("Erro ao buscar classificação:", error);
      return res.status(500).send({
        message: "Erro interno ao buscar classificação.",
      });
    }
  },

  async store(req, res) {
    try {
      const { nome, status, tipo_categoria, quantidade, valor } = req.body;

      // Validação 1: Valor (se informado) deve ser maior que zero
      if (valor !== undefined && valor !== null && parseFloat(valor) <= 0) {
        return res
          .status(400)
          .send({ message: "O valor deve ser maior que zero." });
      }

      // Validação 2: Só pode ter uma classificação do tipo "quantidade"
      if (tipo_categoria === "quantidade") {
        const jaExisteQuantidade = await ClassificacaoCliente.findOne({
          where: { tipo_categoria: "quantidade" },
        });

        if (jaExisteQuantidade) {
          return res.status(400).send({
            message:
              "Já existe uma classificação do tipo 'quantidade'. Só é permitida uma.",
          });
        }
      }

      const novaClassificacao = await ClassificacaoCliente.create({
        nome,
        status,
        tipo_categoria,
        quantidade,
        valor,
      });

      await classificarClientes();

      return res.status(201).send({
        message: "Classificação criada com sucesso!",
        novaClassificacao,
      });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return res
          .status(400)
          .send({ message: "Já existe uma classificação com esse nome." });
      }

      console.error("Erro ao criar classificação:", error);
      return res.status(500).send({
        message: "Erro interno ao criar classificação.",
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, status, tipo_categoria, quantidade, valor } = req.body;

      const classificacao = await ClassificacaoCliente.findByPk(id);

      if (!classificacao) {
        return res
          .status(404)
          .send({ message: "Classificação não encontrada." });
      }

      // Validação 1: garantir que só exista uma classificação de tipo "quantidade"
      if (
        tipo_categoria === "quantidade" &&
        classificacao.tipo_categoria !== "quantidade"
      ) {
        const jaExisteQuantidade = await ClassificacaoCliente.findOne({
          where: {
            tipo_categoria: "quantidade",
            id: { [require("sequelize").Op.ne]: id }, // ignora a própria
          },
        });

        if (jaExisteQuantidade) {
          return res.status(400).send({
            message:
              "Já existe uma classificação do tipo 'quantidade'. Só é permitida uma.",
          });
        }
      }

      await classificacao.update({
        nome,
        status,
        tipo_categoria,
        quantidade,
        valor,
      });

      await classificarClientes();

      return res
        .status(200)
        .send({ message: "Classificação atualizada com sucesso!" });
    } catch (error) {
      console.error("Erro ao atualizar classificação:", error);
      return res.status(500).send({
        message: "Erro interno ao atualizar classificação.",
      });
    }
  },

  // async delete(req, res) {
  //   try {
  //     const { id } = req.params;

  //     const classificacao = await ClassificacaoCliente.findByPk(id);

  //     if (!classificacao) {
  //       return res
  //         .status(404)
  //         .send({ message: "Classificação não encontrada." });
  //     }

  //     await classificacao.destroy();

  //     return res
  //       .status(200)
  //       .send({ message: "Classificação deletada com sucesso." });
  //   } catch (error) {
  //     console.error("Erro ao deletar classificação:", error);
  //     return res.status(500).send({
  //       message: "Erro interno ao deletar classificação.",
  //     });
  //   }
  // },
};
