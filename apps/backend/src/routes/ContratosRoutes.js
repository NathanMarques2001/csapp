const express = require('express');
const ContratoController = require('../controllers/ContratoController.js');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.js');

router.use(authMiddleware);
router.get('/', ContratoController.indexAll);
router.get('/:id', ContratoController.index);
router.get('/cliente/:id', ContratoController.indexClient);
router.get('/vendedor/:id', ContratoController.indexVendedor);
router.post('/', ContratoController.store);
router.put('/:id', ContratoController.update);
// router.delete('/:id', ContratoController.delete);

module.exports = router;