const Segmento = require('../models/Segmento');

module.exports = {
  async index(req, res) {
    try {
      const { id } = req.params;

      const segmento = await Segmento.findByPk(id);

      if (!segmento) {
        return res.status(404).send({ message: 'Segmento não encontrado!' });
      }

      return res.status(200).send({ segmento });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao buscar o segmento.' });
    }
  },

  async indexAll(req, res) {
    try {
      const segmentos = await Segmento.findAll({
        order: [['nome', 'ASC']]
      });

      if (segmentos.length == 0) {
        return res.status(404).send({ message: 'Nenhum segmento cadastrado!' });
      }

      return res.status(200).send({ segmentos });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao buscar os segmentos.' });
    }
  },

  async store(req, res) {
    try {
      const { nome } = req.body;

      const segmento = await Segmento.create({ nome });

      return res.status(201).send({
        message: 'Segmento criado com sucesso!',
        segmento
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao criar o segmento.' });
    }
  },

  async update(req, res) {
    try {
      const { nome, status } = req.body;
      const { id } = req.params;

      const segmento = await Segmento.findByPk(id);

      if (!segmento) {
        return res.status(404).send({ message: 'Segmento não encontrado!' });
      }

      await Segmento.update({ nome, status }, { where: { id: id } });

      return res.status(200).send({ message: 'Segmento atualizado com sucesso!' });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao atualizar o segmento.' });
    }
  },

  // async delete(req, res) {
  //   try {
  //     const { id } = req.params;

  //     const segmento = await Segmento.findByPk(id);

  //     if (!segmento) {
  //       return res.status(404).send({ message: 'Segmento não encontrado!' });
  //     }

  //     await Segmento.destroy({ where: { id: id } });

  //     return res.status(200).send({ message: 'Segmento deletado com sucesso!' });
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).send({ message: 'Ocorreu um erro ao deletar o segmento.' });
  //   }
  // }
}
