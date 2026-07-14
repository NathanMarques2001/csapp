const express = require('express');
const usuarioController = require('./usuario.controller');
const passport = require('passport');
const authMiddleware = require('../../middlewares/autenticacao');

const router = express.Router();

router.post('/login', usuarioController.login);
router.post('/', usuarioController.store);

// 1. Rota de início: O frontend redireciona o usuário para cá
router.get(
  '/login-microsoft',
  passport.authenticate('azuread-openidconnect', {
    prompt: 'select_account',
    failureRedirect: '/api/usuarios/login-failure',
  })
);

router.get(
  '/login-microsoft/callback',
  (req, res, next) => {
    next();
  },
  passport.authenticate('azuread-openidconnect', {
    failureRedirect: '/api/usuarios/login-failure',
  }),
  usuarioController.loginComMicrosoftCallback
);

// Rota de falha genérica
router.get('/login-failure', (req, res) => {
  res.redirect('https://csapp.prolinx.com.br/login?error=microsoft_auth_failed');
});

router.use(authMiddleware);

router.get('/', usuarioController.indexAll);
router.get('/:id', usuarioController.index);
router.put('/:id', usuarioController.update);
router.delete('/:id', usuarioController.delete);

module.exports = router;
