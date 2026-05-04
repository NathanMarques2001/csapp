const express = require('express');
const VencimentoContratosController = require('../controllers/VencimentoContratosController');

const router = express.Router();

router.get('/', VencimentoContratosController.getAll);
router.get('/hoje', VencimentoContratosController.getToday);
router.get('/email/:id_contrato', VencimentoContratosController.emailData);
router.post('/', VencimentoContratosController.create);
router.put('/:id', VencimentoContratosController.update);
router.delete('/:id', VencimentoContratosController.delete);

module.exports = router;