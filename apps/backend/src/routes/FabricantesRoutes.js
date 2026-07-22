const express = require('express');
const FabricanteController = require('../controllers/FabricanteController.js');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.js');

router.use(authMiddleware);
router.get('/', FabricanteController.indexAll);
router.get('/:id', FabricanteController.index);
router.post('/', FabricanteController.store);
router.put('/:id', FabricanteController.update);

module.exports = router;