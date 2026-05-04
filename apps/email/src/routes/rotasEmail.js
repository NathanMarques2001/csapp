const express = require('express');
const router = express.Router();
const controladorEmail = require('../controllers/ControladorEmail.js');

// Rota para envio de e-mails
router.post('/send', controladorEmail.enviarEmail);

module.exports = router;