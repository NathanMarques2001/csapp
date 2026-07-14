const { Router } = require('express');
const historicoController = require('./historico.controller');
const authMiddleware = require('../../middlewares/autenticacao');

const router = new Router();

router.use(authMiddleware);

router.get('/clientes', historicoController.indexClientes);
router.get('/contratos', historicoController.indexContratos);
router.post('/snapshot', historicoController.gerarSnapshotManual);

module.exports = router;
