const Produto = require("../models/Produto");

module.exports = {
  async index(req, res) {
    try {
      const { id } = req.params;

      const produto = await Produto.findByPk(id);

      if (!produto) {
        return res
          .status(404)
          .send({ message: `Nenhum produto cadastrado com id ${id}!` });
      }

      return res.status(200).send({ produto });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao buscar o produto." });
    }
  },

  async indexAll(req, res) {
    try {
      const produtos = await Produto.findAll({
        order: [["nome", "ASC"]],
      });

      // if (produtos.length == 0) {
      //   return res.status(404).send({ message: "Nenhum produto cadastrado!" });
      // }
      return res.status(200).send({ produtos });

      return res.status(200).send({ produtos });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao buscar os produtos." });
    }
  },

  async store(req, res) {
    try {
      const { nome, id_fabricante, id_categoria_produto } = req.body;

      const produto = await Produto.create({
        nome,
        id_fabricante,
        id_categoria_produto,
      });

      return res.status(201).send({
        message: "Produto criado com sucesso!",
        produto,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao criar o produto." });
    }
  },

  async update(req, res) {
    try {
      const { nome, id_fabricante, id_categoria_produto, status } = req.body;
      const { id } = req.params;

      const produto = await Produto.findByPk(id);

      if (!produto) {
        return res.status(404).send({ message: "Produto não encontrado!" });
      }

      await Produto.update(
        { nome, id_fabricante, id_categoria_produto, status },
        { where: { id: id } },
      );

      return res
        .status(200)
        .send({ message: "Produto atualizado com sucesso!" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao atualizar o produto." });
    }
  },

  // async delete(req, res) {
  //   try {
  //     const { id } = req.params;

  //     const produto = await Produto.findByPk(id);

  //     if (!produto) {
  //       return res.status(404).send({ message: 'Produto não encontrado!' });
  //     }

  //     await Produto.destroy({ where: { id: id } });

  //     return res.status(200).send({ message: 'Produto deletado com sucesso!' });
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).send({ message: 'Ocorreu um erro ao deletar o produto.' });
  //   }
  // }
};
