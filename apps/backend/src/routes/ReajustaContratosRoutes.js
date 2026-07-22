const express = require('express');
const ReajustaContratosController = require('../controllers/ReajustaContratosController');
const router = express.Router();

router.get('/', ReajustaContratosController.reajustaContratos);
router.get('/erros', ReajustaContratosController.getErros);

module.exports = router;