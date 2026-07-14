const express = require('express');
const relatorioController = require('./relatorio.controller');
const authMiddleware = require('../../middlewares/autenticacao');

const router = express.Router();

router.get('/geral', authMiddleware, relatorioController.getRelatorioGeral);

module.exports = router;
