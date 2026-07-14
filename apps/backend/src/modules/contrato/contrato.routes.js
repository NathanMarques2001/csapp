const express = require('express');
const contratoController = require('./contrato.controller');
const authMiddleware = require('../../middlewares/autenticacao');
const middlewareUpload = require('../../middlewares/uploadMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', contratoController.indexAll);
router.get('/:id', contratoController.index);
router.get('/cliente/:id', contratoController.indexClient);
router.get('/vendedor/:id', contratoController.indexVendedor);
router.post('/', contratoController.store);
router.put('/:id', contratoController.update);

router.post(
  '/importar-excel',
  middlewareUpload.single('file'),
  contratoController.importarContratosExcel
);

module.exports = router;
