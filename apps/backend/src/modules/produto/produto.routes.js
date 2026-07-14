const express = require('express');
const produtoController = require('./produto.controller');
const authMiddleware = require('../../middlewares/autenticacao');

const router = express.Router();

router.use(authMiddleware);

router.route('/')
  .get(produtoController.indexAll)
  .post(produtoController.store);

router.route('/:id')
  .get(produtoController.index)
  .put(produtoController.update);

module.exports = router;
