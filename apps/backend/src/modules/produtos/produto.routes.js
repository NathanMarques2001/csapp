const express = require('express');
const router = express.Router();

const produtoController = require('./produto.controller');
const validator = require('../../common/dtos/validator.middleware');
const schemas = require('./dtos/produto.dto');
const authMiddleware = require('../../middlewares/auth');

// Aplica autenticação em todas rotas de produtos
router.use(authMiddleware);

router.get(
    '/',
    validator(schemas.listProdutosSchema),
    produtoController.indexAll
);

router.get(
    '/:id',
    validator(schemas.getProdutoSchema),
    produtoController.index
);

router.post(
    '/',
    validator(schemas.createProdutoSchema),
    produtoController.store
);

router.put(
    '/:id',
    validator(schemas.updateProdutoSchema),
    produtoController.update
);

module.exports = router;
