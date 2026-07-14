const CategoriaProduto = require("../models/CategoriaProduto");

module.exports = {
  async index(req, res) {
    try {
      const categorias = await CategoriaProduto.findAll({
        order: [["nome", "ASC"]],
      });
      return res.status(200).json({ categorias });
    } catch (err) {
      console.error("Erro ao listar categorias de produto:", err);
      return res.status(500).json({ message: "Erro ao buscar categorias." });
    }
  },

  async show(req, res) {
    try {
      const { id } = req.params;
      const categoria = await CategoriaProduto.findByPk(id);
      if (!categoria) {
        return res.status(404).json({ message: "Categoria não encontrada." });
      }
      return res.status(200).json({ categoria });
    } catch (err) {
      console.error("Erro ao buscar categoria:", err);
      return res.status(500).json({ message: "Erro ao buscar categoria." });
    }
  },

  async store(req, res) {
    try {
      const { nome, status } = req.body;

      const categoriaExistente = await CategoriaProduto.findOne({
        where: { nome },
      });

      if (categoriaExistente) {
        return res
          .status(400)
          .json({ message: "Já existe uma categoria com esse nome." });
      }

      const novaCategoria = await CategoriaProduto.create({
        nome,
        status: status || "ativo",
      });

      return res.status(201).json({
        message: "Categoria criada com sucesso!",
        categoria: novaCategoria,
      });
    } catch (err) {
      console.error("Erro ao criar categoria:", err);
      return res.status(500).json({ message: "Erro ao criar categoria." });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, status } = req.body;

      const categoria = await CategoriaProduto.findByPk(id);
      if (!categoria) {
        return res.status(404).json({ message: "Categoria não encontrada." });
      }

      await categoria.update({ nome, status });

      return res
        .status(200)
        .json({ message: "Categoria atualizada com sucesso!", categoria });
    } catch (err) {
      console.error("Erro ao atualizar categoria:", err);
      return res.status(500).json({ message: "Erro ao atualizar categoria." });
    }
  },

  //   async delete(req, res) {
  //     try {
  //       const { id } = req.params;
  //       const categoria = await CategoriaProduto.findByPk(id);

  //       if (!categoria) {
  //         return res.status(404).json({ message: "Categoria não encontrada." });
  //       }

  //       await categoria.update({ status: "inativo" });

  //       return res
  //         .status(200)
  //         .json({ message: "Categoria inativada com sucesso." });
  //     } catch (err) {
  //       console.error("Erro ao inativar categoria:", err);
  //       return res.status(500).json({ message: "Erro ao inativar categoria." });
  //     }
  //   },
};
