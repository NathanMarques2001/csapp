const express = require('express');
const fabricanteController = require('./fabricante.controller');
const authMiddleware = require('../../middlewares/autenticacao');

const router = express.Router();

router.use(authMiddleware);

router.route('/')
  .get(fabricanteController.indexAll)
  .post(fabricanteController.store);

router.route('/:id')
  .get(fabricanteController.index)
  .put(fabricanteController.update);

module.exports = router;
