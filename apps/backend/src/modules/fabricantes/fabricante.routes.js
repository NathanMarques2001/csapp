const express = require('express');
const router = express.Router();

const fabricanteController = require('./fabricante.controller');
const validator = require('../../common/dtos/validator.middleware');
const schemas = require('./dtos/fabricante.dto');
const authMiddleware = require('../../middlewares/auth');

router.use(authMiddleware);

router.get(
    '/',
    validator(schemas.listFabricantesSchema),
    fabricanteController.indexAll
);

router.get(
    '/:id',
    validator(schemas.getFabricanteSchema),
    fabricanteController.index
);

router.post(
    '/',
    validator(schemas.createFabricanteSchema),
    fabricanteController.store
);

router.put(
    '/:id',
    validator(schemas.updateFabricanteSchema),
    fabricanteController.update
);

module.exports = router;
