const Faturado = require("../models/Faturado");

module.exports = {
  async index(req, res) {
    try {
      const { id } = req.params;

      const faturado = await Faturado.findByPk(id);

      if (!faturado) {
        return res.status(404).send({ message: "Faturado não encontrado!" });
      }

      return res.status(200).send({ faturado });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao buscar o faturado." });
    }
  },

  async indexAll(req, res) {
    try {
      const faturados = await Faturado.findAll({
        order: [["nome", "ASC"]],
      });

      if (faturados.length == 0) {
        return res.status(404).send({ message: "Nenhum faturado cadastrado!" });
      }

      return res.status(200).send({ faturados });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao buscar os faturados." });
    }
  },

  async store(req, res) {
    try {
      const { nome } = req.body;

      const faturado = await Faturado.create({ nome });

      return res.status(201).send({
        message: "Faturado criado com sucesso!",
        faturado,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao criar o faturado." });
    }
  },

  async update(req, res) {
    try {
      const { nome, status } = req.body;
      const { id } = req.params;

      const faturado = await Faturado.findByPk(id);

      if (!faturado) {
        return res.status(404).send({ message: "Faturado não encontrado!" });
      }

      await Faturado.update({ nome, status }, { where: { id: id } });

      return res
        .status(200)
        .send({ message: "Faturado atualizado com sucesso!" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Ocorreu um erro ao atualizar o faturado." });
    }
  },

  // async delete(req, res) {
  //   try {
  //     const { id } = req.params;

  //     const fabricante = await Fabricante.findByPk(id);

  //     if (!fabricante) {
  //       return res.status(404).send({ message: 'Fabricante não encontrado!' });
  //     }

  //     await Fabricante.destroy({ where: { id: id } });

  //     return res.status(200).send({ message: 'Fabricante deletado com sucesso!' });
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).send({ message: 'Ocorreu um erro ao deletar o fabricante.' });
  //   }
  // }
};
