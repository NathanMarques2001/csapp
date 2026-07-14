const express = require('express');
const logController = require('./log.controller');
const authMiddleware = require('../../middlewares/autenticacao');

const router = express.Router();

router.use(authMiddleware);

router.route('/')
  .get(logController.indexAll)
  .post(logController.store);

router.route('/:id_contrato')
  .get(logController.index);

module.exports = router;
