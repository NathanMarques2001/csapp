const express = require('express');
const fatosImportantesController = require('./fatos-importantes.controller');
const authMiddleware = require('../../middlewares/autenticacao');

const router = express.Router();

router.use(authMiddleware);

router.get('/', fatosImportantesController.indexAll);
router.get('/:id_cliente', fatosImportantesController.index);
router.get('/fato/:id', fatosImportantesController.indexFato);
router.post('/', fatosImportantesController.store);
router.put('/:id', fatosImportantesController.update);
router.delete('/:id', fatosImportantesController.delete);

module.exports = router;
