const express = require('express');
const ReajustaContratosController = require('../controllers/ReajustaContratosController');
const router = express.Router();

router.get('/', ReajustaContratosController.reajustaContratos);

module.exports = router;