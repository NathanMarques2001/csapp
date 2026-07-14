const express = require('express');
const grupoEconomicoController = require('./grupo-economico.controller');
const authMiddleware = require('../../middlewares/autenticacao');

const router = express.Router();

router.use(authMiddleware);

router.get('/', grupoEconomicoController.indexAll);
router.get('/:id', grupoEconomicoController.index);
router.post('/', grupoEconomicoController.store);
router.put('/:id', grupoEconomicoController.update);
router.put('/active-inactive/:id', grupoEconomicoController.inactiveOrActive);

module.exports = router;
