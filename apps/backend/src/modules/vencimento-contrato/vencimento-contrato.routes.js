const express = require('express');
const vencimentoContratoController = require('./vencimento-contrato.controller');

const router = express.Router();

router.get('/', vencimentoContratoController.getAll);
router.get('/hoje', vencimentoContratoController.getToday);
router.get('/email/:id_contrato', vencimentoContratoController.emailData);
router.post('/', vencimentoContratoController.create);
router.put('/:id', vencimentoContratoController.update);
router.delete('/:id', vencimentoContratoController.delete);

module.exports = router;
