const express = require('express');
const ResetSenhaController = require('../controllers/ResetSenhaController');
const router = express.Router();

router.post('/', ResetSenhaController.store);
router.post('/reset', ResetSenhaController.reset);
router.delete('/remove-expired-tokens', ResetSenhaController.removeExpiredTokens);

module.exports = router;