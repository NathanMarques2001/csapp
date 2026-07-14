const express = require('express');
const resetSenhaController = require('./reset-senha.controller');

const router = express.Router();

router.post('/', resetSenhaController.store);
router.post('/reset', resetSenhaController.reset);
router.delete('/remove-expired-tokens', resetSenhaController.removeExpiredTokens);

module.exports = router;
