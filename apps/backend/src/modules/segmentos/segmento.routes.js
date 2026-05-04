const express = require('express');
const router = express.Router();

const segmentoController = require('./segmento.controller');
const validator = require('../../common/dtos/validator.middleware');
const schemas = require('./dtos/segmento.dto');
const authMiddleware = require('../../middlewares/auth');

router.use(authMiddleware);

router.get(
    '/',
    validator(schemas.listSegmentosSchema),
    segmentoController.indexAll
);

router.get(
    '/:id',
    validator(schemas.getSegmentoSchema),
    segmentoController.index
);

router.post(
    '/',
    validator(schemas.createSegmentoSchema),
    segmentoController.store
);

router.put(
    '/:id',
    validator(schemas.updateSegmentoSchema),
    segmentoController.update
);

module.exports = router;
