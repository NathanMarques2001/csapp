const express = require('express');
const faturadoController = require('./faturado.controller');
const authMiddleware = require('../../middlewares/autenticacao');

const router = express.Router();

router.use(authMiddleware);

router.route('/')
  .get(faturadoController.indexAll)
  .post(faturadoController.store);

router.route('/:id')
  .get(faturadoController.index)
  .put(faturadoController.update);

module.exports = router;
