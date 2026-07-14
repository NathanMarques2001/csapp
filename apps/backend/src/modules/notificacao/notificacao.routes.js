const express = require('express');
const notificacaoController = require('./notificacao.controller');
const authMiddleware = require('../../middlewares/autenticacao');

const router = express.Router();

router.use(authMiddleware);

router.get('/', notificacaoController.listar);
router.get('/ativas', notificacaoController.listarAtivas);
router.get('/usuario/:id_usuario', notificacaoController.listarPorUsuario);
router.post('/', notificacaoController.criar);
router.put('/:id/confirmar', notificacaoController.confirmar);

module.exports = router;
