const express = require('express');
const clienteController = require('./cliente.controller');
const authMiddleware = require('../../middlewares/autenticacao');

const router = express.Router();

router.use(authMiddleware);

router.get('/gestores-nascimento', clienteController.gestoresComNascimento);
router.get('/', clienteController.indexAll);
router.get('/:id', clienteController.index);
router.get('/grupo-economico/:id', clienteController.indexGrupoEconomico);
router.post('/', clienteController.store);
router.put('/migrate', clienteController.migrate);
router.put('/active-inactive/:id', clienteController.inactiveOrActive);
router.put('/:id', clienteController.update);

module.exports = router;
