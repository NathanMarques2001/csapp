const express = require('express');
const classificacaoClienteController = require('./classificacao-cliente.controller');
const authMiddleware = require('../../middlewares/autenticacao');

const router = express.Router();

router.use(authMiddleware);

router.get('/', classificacaoClienteController.index);
router.get('/:id', classificacaoClienteController.show);
router.post('/', classificacaoClienteController.store);
router.put('/:id', classificacaoClienteController.update);

module.exports = router;
