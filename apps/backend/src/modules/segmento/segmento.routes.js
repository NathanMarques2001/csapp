const express = require('express');
const segmentoController = require('./segmento.controller');
const authMiddleware = require('../../middlewares/autenticacao');

const router = express.Router();

router.use(authMiddleware);

router.route('/')
  .get(segmentoController.indexAll)
  .post(segmentoController.store);

router.route('/:id')
  .get(segmentoController.index)
  .put(segmentoController.update);

module.exports = router;
