const express = require('express');
const contatoTecnicoController = require('./contato-tecnico.controller');
const authMiddleware = require('../../middlewares/autenticacao');

const router = express.Router();

router.use(authMiddleware);

router.get('/', contatoTecnicoController.indexAll);
router.get('/:id_cliente', contatoTecnicoController.index);
router.get('/contato/:id', contatoTecnicoController.indexContato);
router.post('/', contatoTecnicoController.store);
router.put('/:id', contatoTecnicoController.update);
router.delete('/:id', contatoTecnicoController.delete);

module.exports = router;
