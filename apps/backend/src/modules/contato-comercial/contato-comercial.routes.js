const express = require('express');
const contatoComercialController = require('./contato-comercial.controller');
const authMiddleware = require('../../middlewares/autenticacao');

const router = express.Router();

router.use(authMiddleware);

router.get('/', contatoComercialController.indexAll);
router.get('/:id_cliente', contatoComercialController.index);
router.get('/contato/:id', contatoComercialController.indexContato);
router.post('/', contatoComercialController.store);
router.put('/:id', contatoComercialController.update);
router.delete('/:id', contatoComercialController.delete);

module.exports = router;
