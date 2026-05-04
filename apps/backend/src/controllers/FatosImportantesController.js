const FatosImportantes = require('../models/FatosImportantes');
const Cliente = require('../models/Cliente');

module.exports = {
  async index(req, res) {
    try {
      const { id_cliente } = req.params;

      const cliente = await Cliente.findByPk(id_cliente, {
        include: { association: 'fatos_importantes' }
      });

      if (!cliente) {
        return res.status(404).send({ message: 'Cliente não encontrado!' });
      }

      return res.status(200).send({ fatos_importantes: cliente.fatos_importantes });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Erro ao buscar os fatos importantes.' });
    }
  },

  async indexFato(req, res) {
    try {
      const { id } = req.params;

      const fatoImportante = await FatosImportantes.findByPk(id);

      if (!fatoImportante) {
        return res.status(404).send({ message: 'Fato importante não encontrado!' });
      }

      return res.status(200).send({ fatoImportante });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Erro ao buscar o fato importante.' });
    }
  },

  async indexAll(req, res) {
    try {
      const fatosImportantes = await FatosImportantes.findAll();

      return res.status(200).send({ fatosImportantes });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao buscar os fatos importantes.' });
    }
  },

  async store(req, res) {
    try {
      const { id_cliente, conteudo } = req.body;

      if (!conteudo) {
        return res.status(400).send({ message: 'O campo conteúdo é obrigatório!' });
      } else if (!id_cliente) {
        return res.status(400).send({ message: 'O campo id_cliente é obrigatório!' });
      }

      const fatoImportante = await FatosImportantes.create({ id_cliente, conteudo });

      return res.status(201).send({
        message: 'Fato importante criado com sucesso!',
        fatoImportante
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao criar o fato importante.' });
    }
  },

  async update(req, res) {
    try {
      const { conteudo } = req.body;
      const { id } = req.params;

      const fatoImportante = await FatosImportantes.findByPk(id);

      if (!fatoImportante) {
        return res.status(404).send({ message: 'Fato importante não encontrado!' });
      } else if (!conteudo) {
        return res.status(400).send({ message: 'O campo conteúdo é obrigatório!' });
      }

      await FatosImportantes.update({ conteudo }, { where: { id: id } });

      return res.status(200).send({ message: 'Fato importante atualizado com sucesso!' });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao atualizar o fato importante.' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const fatoImportante = await FatosImportantes.findByPk(id);

      if (!fatoImportante) {
        return res.status(404).send({ message: 'Fato importante não encontrado!' });
      }

      await FatosImportantes.destroy({ where: { id: id } });

      return res.status(200).send({ message: 'Fato importante deletado com sucesso!' });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao deletar o fato importante.' });
    }
  }
}
