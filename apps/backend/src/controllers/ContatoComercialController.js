const Cliente = require('../models/Cliente');
const ContatoComercial = require('../models/ContatoComercial');

module.exports = {
  async index(req, res) {
    try {
      const { id_cliente } = req.params;

      const cliente = await Cliente.findByPk(id_cliente, {
        include: { association: 'contatos_comerciais' }
      });

      if (!cliente) {
        return res.status(404).send({ message: 'Cliente não encontrado!' });
      }

      return res.status(200).send({ contatos_comerciais: cliente.contatos_comerciais });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Erro ao buscar os contatos comerciais.' });
    }
  },

  async indexContato(req, res) {
    try {
      const { id } = req.params;

      const contatoComercial = await ContatoComercial.findByPk(id);

      if (!contatoComercial) {
        return res.status(404).send({ message: 'Contato comercial não encontrado!' });
      }

      return res.status(200).send({ contatoComercial });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Erro ao buscar o contato comercial.' });
    }
  },

  async indexAll(req, res) {
    try {
      const contatosComerciais = await ContatoComercial.findAll();

      return res.status(200).send({ contatosComerciais });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Erro ao buscar os contatos comerciais.' });
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

      const contatoComercial = await ContatoComercial.create({ id_cliente, conteudo });
      return res.status(201).send({
        message: 'Contato comercial criado com sucesso!',
        contatoComercial
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao criar o contato comercial.' });
    }
  },

  async update(req, res) {
    try {
      const { conteudo } = req.body;
      const { id } = req.params;

      const contatoComercial = await ContatoComercial.findByPk(id);

      if (!contatoComercial) {
        return res.status(404).send({ message: 'Contato comercial não encontrado!' });
      } else if (!conteudo) {
        return res.status(400).send({ message: 'O campo conteúdo é obrigatório!' });
      }

      ContatoComercial.update({ conteudo }, { where: { id: id } });

      return res.status(200).send({ message: 'Contato comercial atualizado com sucesso!' });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao atualizar o contato comercial.' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const contatoComercial = await ContatoComercial.findByPk(id);

      if (!contatoComercial) {
        return res.status(404).send({ message: 'Contato comercial não encontrado!' });
      }

      ContatoComercial.destroy({ where: { id: id } });

      return res.status(200).send({ message: 'Contato comercial deletado com sucesso!' });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao deletar o contato comercial.' });
    }
  }
}
