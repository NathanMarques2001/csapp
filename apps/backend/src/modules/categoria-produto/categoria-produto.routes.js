const express = require('express');
const router = express.Router();
const categoriaProdutoController = require('./categoria-produto.controller');
const authMiddleware = require('../../middlewares/auth');

router.use(authMiddleware);

router.get('/', categoriaProdutoController.indexAll);
router.get('/:id', categoriaProdutoController.index);
router.post('/', categoriaProdutoController.store);
router.put('/:id', categoriaProdutoController.update);

module.exports = router;
