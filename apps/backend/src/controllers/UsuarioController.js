const Usuario = require('../models/Usuario.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('/var/www/scrt/secret.json');
const jwksClient = require('jwks-rsa');

function gerarToken({ id, nome, tipo }) {
  const expireAt = new Date();
  expireAt.setHours(6, 0, 0, 0);
  expireAt.setDate(expireAt.getDate() + 1);

  const payload = {
    id,
    nome,
    tipo,
    amr: ["mfa"]
  };

  return jwt.sign(payload, authConfig.secret, { expiresIn: '1d' });
}

module.exports = {
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).send({ message: 'E-mail e senha são obrigatórios.' });
      }

      const usuario = await Usuario.findOne({ where: { email: email } });
      const MENSAGEM_ERRO_PADRAO = 'E-mail ou senha incorretos!';

      if (!usuario) {
        return res.status(404).send({ message: MENSAGEM_ERRO_PADRAO });
      }

      // FILTRO 1: Se for uma conta Microsoft, barramos a entrada aqui.
      if (usuario.microsoft_oid && !usuario.senha) {
        // A função termina aqui para usuários Microsoft. O código abaixo NUNCA é executado para eles.
        return res.status(403).send({
          message: 'Esta conta deve ser acessada através do botão "Entrar com Microsoft".'
        });
      }

      // FILTRO 2: Se chegou até aqui, NÃO é um usuário Microsoft. 
      // Agora, garantimos que ele tenha uma senha para poder comparar.
      if (!usuario.senha) {
        // Se um usuário não-Microsoft não tiver senha por algum erro, barramos aqui.
        return res.status(404).send({ message: MENSAGEM_ERRO_PADRAO });
      }

      // PONTO SEGURO: Se o código chegou até aqui, temos certeza que `usuario.senha` contém um hash.
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

      if (!senhaCorreta) {
        return res.status(404).send({ message: MENSAGEM_ERRO_PADRAO });
      }

      // Lógica de sucesso...
      await Usuario.update({ logado: true }, { where: { id: usuario.id } });
      usuario.senha = undefined;
      const token = gerarToken({
        id: usuario.id,
        nome: usuario.nome,
        tipo: usuario.tipo
      });

      return res.status(200).send({
        message: 'Usuário logado com sucesso!',
        usuario, token
      });
    } catch (error) {
      console.error('Ocorreu um erro no login:', error);
      return res.status(500).send({ message: 'Ocorreu um erro interno ao tentar fazer login.' });
    }
  },

  async loginComMicrosoftCallback(req, res) {
    console.log('----------------------------------------------------');
    console.log('[DEBUG] CHEGUEI NO CONTROLLER PARA GERAR O TOKEN!');
    console.log('[DEBUG] Usuário processado pelo Passport:', req.user?.nome); // Usamos ?. para evitar erro se req.user for nulo
    console.log('----------------------------------------------------');
    try {
      // O 'req.user' é populado pela função 'done' do Passport.js
      const usuario = req.user;
      const token = gerarToken({
        id: usuario.id,
        nome: usuario.nome,
        tipo: usuario.tipo
      });

      return res.redirect(`https://csapp.prolinx.com.br/auth/callback?token=${token}`);

    } catch (error) {
      console.error("Erro no callback do login Microsoft:", error);
      return res.redirect('https://csapp.prolinx.com.br/login');
    }
  },

  async index(req, res) {
    try {
      const { id } = req.params;

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).send({ message: 'Usuário não encontrado!' });
      }

      return res.status(200).send({ usuario });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao buscar o usuário.' });
    }
  },

  async indexAll(req, res) {
    try {
      const usuarios = await Usuario.findAll({
        order: [['nome', 'ASC']]
      });

      if (usuarios.length == 0) {
        return res.status(404).send({ message: 'Nenhum usuário cadastrado!' });
      }

      return res.status(200).send({ usuarios });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao buscar os usuários.' });
    }
  },

  async store(req, res) {
    try {
      const { nome, email, tipo, senha } = req.body;

      const usuario = await Usuario.create({ nome, email, tipo, senha });

      return res.status(201).send({
        message: 'Usuário criado com sucesso!',
        usuario
      });
    } catch (error) {
      if (error.name == 'SequelizeUniqueConstraintError') {
        return res.status(400).send({ message: 'E-mail já cadastrado!' });
      }
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao criar o usuário.' });
    }
  },

  async update(req, res) {
    try {
      const { nome, email, tipo, senha } = req.body;
      const { id } = req.params;

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).send({ message: 'Usuário não encontrado!' });
      }

      usuario.nome = nome;
      usuario.email = email;
      usuario.tipo = tipo;

      if (senha) {
        usuario.senha = senha;
      }

      await usuario.save();

      return res.status(200).send({ message: 'Usuário atualizado com sucesso!' });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao atualizar o usuário.' });
    }
  }
  ,

  async delete(req, res) {
    try {
      const { id } = req.params;

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).send({ message: 'Usuário não encontrado!' });
      }

      await Usuario.destroy({ where: { id: id } });

      return res.status(200).send({ message: 'Usuário deletado com sucesso!' });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Ocorreu um erro ao deletar o usuário.' });
    }
  }
}
