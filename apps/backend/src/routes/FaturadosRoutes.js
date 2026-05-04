const express = require('express');
const FaturadosController = require('../controllers/FaturadosController.js');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.js');

router.use(authMiddleware);
router.get('/', FaturadosController.indexAll);
router.get('/:id', FaturadosController.index);
router.post('/', FaturadosController.store);
router.put('/:id', FaturadosController.update);
// router.delete('/:id', FaturadosController.delete);

module.exports = router;