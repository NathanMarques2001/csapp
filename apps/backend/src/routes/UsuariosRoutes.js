const express = require('express');
const UsuarioController = require('../controllers/UsuarioController.js');
const router = express.Router();
const passport = require('passport');
const authMiddleware = require('../middlewares/auth.js');

router.post('/login', UsuarioController.login);
router.post('/', UsuarioController.store);

// 1. Rota de início: O frontend redireciona o usuário para cá
router.get('/login-microsoft',
    passport.authenticate('azuread-openidconnect', {
        prompt: 'select_account',
        failureRedirect: '/login-failure'
    })
);

router.post('/login-microsoft/callback', (req, res, next) => {
    next();
},
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/login-failure' }),
    UsuarioController.loginComMicrosoftCallback
);


// Rota de falha genérica
router.get('/login-failure', (req, res) => {
    res.status(401).send({ message: 'Falha no login com a Microsoft.' });
});

router.use(authMiddleware);
router.get('/', UsuarioController.indexAll);
router.get('/:id', UsuarioController.index);
router.put('/:id', UsuarioController.update);
router.delete('/:id', UsuarioController.delete);

module.exports = router;